import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Dimensions,
  Platform,
  Share,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons, AntDesign } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Chart component (simplified version without actual library dependency)
const LineChart = ({ data, labels }) => {
  // Get the maximum value in the data or use 1 if all values are 0
  const maxValue = Math.max(...data) || 1;
  
  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>বিক্রয় রিপোর্ট চার্ট</Text>
      <View style={styles.chartContent}>
        <View style={styles.yAxis}>
          {[4, 3, 2, 1, 0].map((value, index) => (
            <Text key={index} style={styles.yAxisLabel}>
              {Math.round(maxValue * value / 4).toLocaleString()}
            </Text>
          ))}
        </View>
        <View style={styles.chartBars}>
          {data.map((value, index) => {
            // Calculate height in pixels (scale from 0 to 150px max)
            const heightPixels = maxValue > 0 ? (value / maxValue) * 150 : 0;
            
            return (
              <View key={index} style={styles.barWrapper}>
                <View 
                  style={[
                    styles.bar, 
                    { height: heightPixels },
                    index % 2 === 0 ? { backgroundColor: '#3498db' } : { backgroundColor: '#2980b9' }
                  ]} 
                />
                <Text style={styles.barValue}>{value > 999 ? `${Math.round(value/1000)}K` : value}</Text>
              </View>
            );
          })}
        </View>
      </View>
      <View style={styles.xAxis}>
        {labels.map((label, idx) => (
          <Text key={idx} style={styles.xAxisLabel}>{label}</Text>
        ))}
      </View>
    </View>
  );
};

const ReportScreen = () => {
  const navigation = useNavigation();
  const [reportType, setReportType] = useState('daily');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalSales, setTotalSales] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [topProducts, setTopProducts] = useState([]);
  const [chartData, setChartData] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [chartLabels, setChartLabels] = useState(['সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি', 'রবি']);
  
  // Get all sales data from storage
  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const salesJson = await AsyncStorage.getItem('sales');
      let allSales = salesJson ? JSON.parse(salesJson) : [];
      
      // Filter sales based on report type and date range
      let filteredSales = allSales.filter(sale => {
        const saleDate = new Date(sale.date);
        
        if (reportType === 'daily') {
          // Filter for daily - same day
          return saleDate.getDate() === startDate.getDate() && 
                 saleDate.getMonth() === startDate.getMonth() && 
                 saleDate.getFullYear() === startDate.getFullYear();
        } else if (reportType === 'weekly') {
          // Filter for weekly - between startDate and endDate
          return saleDate >= startDate && saleDate <= endDate;
        } else if (reportType === 'monthly') {
          // Filter for monthly - same month and year
          return saleDate.getMonth() === startDate.getMonth() && 
                 saleDate.getFullYear() === startDate.getFullYear();
        }
        return false;
      });
      
      // Calculate total sales and profit
      let total = 0;
      let profit = 0;
      
      filteredSales.forEach(sale => {
        total += sale.totalAmount;
        profit += sale.totalProfit;
      });
      
      setTotalSales(total);
      setTotalProfit(profit);
      setSalesData(filteredSales);
      
      // Calculate top selling products
      const productMap = {};
      filteredSales.forEach(sale => {
        sale.items.forEach(item => {
          const key = `${item.category}-${item.company}-${item.product}`;
          if (!productMap[key]) {
            productMap[key] = {
              name: `${item.category} - ${item.company} - ${item.product}`,
              quantity: 0,
              revenue: 0
            };
          }
          productMap[key].quantity += item.quantity;
          productMap[key].revenue += item.quantity * item.sellingPrice;
        });
      });
      
      const topProductsList = Object.values(productMap)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      
      setTopProducts(topProductsList);
      
      // Generate chart data based on report type
      if (reportType === 'daily') {
        // For daily, show hourly data
        const hourlyData = Array(24).fill(0);
        filteredSales.forEach(sale => {
          const saleHour = new Date(sale.date).getHours();
          hourlyData[saleHour] += sale.totalAmount;
        });
        
        // Group by 4 hours for better visualization
        const groupedData = [
          hourlyData.slice(0, 4).reduce((a, b) => a + b, 0),
          hourlyData.slice(4, 8).reduce((a, b) => a + b, 0),
          hourlyData.slice(8, 12).reduce((a, b) => a + b, 0),
          hourlyData.slice(12, 16).reduce((a, b) => a + b, 0),
          hourlyData.slice(16, 20).reduce((a, b) => a + b, 0),
          hourlyData.slice(20, 24).reduce((a, b) => a + b, 0)
        ];
        
        setChartData(groupedData);
        setChartLabels(['12-4AM', '4-8AM', '8-12PM', '12-4PM', '4-8PM', '8-12AM']);
      } else if (reportType === 'weekly') {
        // For weekly, show daily data
        const dailyData = Array(7).fill(0);
        filteredSales.forEach(sale => {
          const saleDayOfWeek = new Date(sale.date).getDay();
          dailyData[saleDayOfWeek] += sale.totalAmount;
        });
        
        setChartData(dailyData);
        setChartLabels(['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি']);
      } else if (reportType === 'monthly') {
        // For monthly, show weekly data
        const daysInMonth = new Date(
          startDate.getFullYear(),
          startDate.getMonth() + 1,
          0
        ).getDate();
        
        const weeksData = Array(Math.ceil(daysInMonth / 7)).fill(0);
        
        filteredSales.forEach(sale => {
          const saleDay = new Date(sale.date).getDate();
          const weekIndex = Math.floor((saleDay - 1) / 7);
          weeksData[weekIndex] += sale.totalAmount;
        });
        
        setChartData(weeksData);
        setChartLabels(weeksData.map((_, index) => `সপ্তাহ ${index + 1}`));
      }
    } catch (error) {
      console.error('Error loading sales data:', error);
      Alert.alert('Error', 'রিপোর্ট ডাটা লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    setupDateRange();
  }, [reportType]);
  
  useEffect(() => {
    fetchSalesData();
  }, [reportType, startDate, endDate]);
  
  const setupDateRange = () => {
    const today = new Date();
    
    if (reportType === 'daily') {
      setStartDate(today);
      setEndDate(today);
    } else if (reportType === 'weekly') {
      // Set start date to beginning of current week (Sunday)
      const firstDay = new Date(today);
      const dayOfWeek = today.getDay();
      const diff = dayOfWeek === 0 ? 0 : dayOfWeek;
      firstDay.setDate(today.getDate() - diff);
      
      // Set end date to end of week (Saturday)
      const lastDay = new Date(firstDay);
      lastDay.setDate(firstDay.getDate() + 6);
      
      setStartDate(firstDay);
      setEndDate(lastDay);
    } else if (reportType === 'monthly') {
      // Set start date to first day of current month
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      
      // Set end date to last day of current month
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      setStartDate(firstDay);
      setEndDate(lastDay);
    }
  };
  
  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };
  
  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };
  
  const shareReport = async () => {
    try {
      let reportContent = `বিক্রয় রিপোর্ট\n`;
      reportContent += `রিপোর্টের ধরণ: ${reportType === 'daily' ? 'দৈনিক' : reportType === 'weekly' ? 'সাপ্তাহিক' : 'মাসিক'}\n`;
      reportContent += `তারিখ: ${startDate.toLocaleDateString()}\n`;
      if (reportType !== 'daily') {
        reportContent += `থেকে: ${endDate.toLocaleDateString()}\n`;
      }
      reportContent += `\nমোট বিক্রয়: ${totalSales} টাকা\n`;
      reportContent += `মোট লাভ: ${totalProfit} টাকা\n\n`;
      
      reportContent += `সর্বাধিক বিক্রিত পণ্য:\n`;
      topProducts.forEach((product, index) => {
        reportContent += `${index + 1}. ${product.name} - ${product.quantity}টি - ${product.revenue} টাকা\n`;
      });
      
      await Share.share({
        message: reportContent,
      });
    } catch (error) {
      Alert.alert('Error', 'রিপোর্ট শেয়ার করতে সমস্যা হয়েছে।');
    }
  };
  
  // Generate HTML content for PDF
  const generatePdfHtml = () => {
    // Create formatted prices
    const formattedTotal = totalSales.toLocaleString();
    const formattedProfit = totalProfit.toLocaleString();
    
    // Create top products HTML
    let productsHTML = '';
    if (topProducts.length > 0) {
      topProducts.forEach((product, index) => {
        productsHTML += `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px;">${index + 1}</td>
            <td style="padding: 8px;">${product.name}</td>
            <td style="padding: 8px; text-align: center;">${product.quantity}</td>
            <td style="padding: 8px; text-align: right;">${product.revenue.toLocaleString()} টাকা</td>
          </tr>
        `;
      });
    } else {
      productsHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: 16px;">কোন পণ্য বিক্রয় নেই</td>
        </tr>
      `;
    }
    
    // Create sales list HTML
    let salesHTML = '';
    if (salesData.length > 0) {
      salesData.forEach((sale, index) => {
        salesHTML += `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px;">${index + 1}</td>
            <td style="padding: 8px;">${new Date(sale.date).toLocaleDateString()}</td>
            <td style="padding: 8px;">${sale.customerName || 'অজানা'}</td>
            <td style="padding: 8px; text-align: center;">${sale.items.length}</td>
            <td style="padding: 8px; text-align: right;">${sale.totalAmount.toLocaleString()} টাকা</td>
            <td style="padding: 8px; text-align: right;">${sale.totalProfit.toLocaleString()} টাকা</td>
          </tr>
        `;
      });
    } else {
      salesHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 16px;">কোন বিক্রয় নেই</td>
        </tr>
      `;
    }
    
    // Create HTML for the PDF
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body {
              font-family: 'Helvetica', sans-serif;
              margin: 0;
              padding: 16px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 24px;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 8px;
            }
            .subtitle {
              font-size: 16px;
              color: #666;
              margin-bottom: 4px;
            }
            .summary-container {
              display: flex;
              justify-content: space-between;
              margin-bottom: 24px;
              margin-top: 32px;
            }
            .summary-card {
              background-color: #f7f7f7;
              border-radius: 8px;
              padding: 16px;
              text-align: center;
              width: 30%;
            }
            .summary-value {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 4px;
            }
            .summary-label {
              font-size: 12px;
              color: #666;
            }
            .section {
              margin-top: 32px;
            }
            .section-title {
              font-size: 18px;
              margin-bottom: 16px;
              padding-bottom: 8px;
              border-bottom: 2px solid #eee;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th {
              background-color: #f2f2f2;
              padding: 8px;
              text-align: left;
              font-size: 14px;
            }
            td {
              padding: 8px 4px;
              font-size: 12px;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #999;
              padding-top: 16px;
              border-top: 1px solid #eee;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>বিক্রয় রিপোর্ট</h1>
            <div class="subtitle">
              ${reportType === 'daily' ? 'দৈনিক রিপোর্ট' : reportType === 'weekly' ? 'সাপ্তাহিক রিপোর্ট' : 'মাসিক রিপোর্ট'}
            </div>
            <div class="subtitle">
              ${startDate.toLocaleDateString()}
              ${reportType !== 'daily' ? ` থেকে ${endDate.toLocaleDateString()}` : ''}
            </div>
          </div>

          <div class="summary-container">
            <div class="summary-card">
              <div class="summary-value">${formattedTotal} টাকা</div>
              <div class="summary-label">মোট বিক্রয়</div>
            </div>
            
            <div class="summary-card">
              <div class="summary-value">${formattedProfit} টাকা</div>
              <div class="summary-label">মোট লাভ</div>
            </div>
            
            <div class="summary-card">
              <div class="summary-value">${salesData.length}</div>
              <div class="summary-label">মোট অর্ডার</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">সর্বাধিক বিক্রিত পণ্য</div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>পণ্য</th>
                  <th style="text-align: center;">পরিমাণ</th>
                  <th style="text-align: right;">মূল্য</th>
                </tr>
              </thead>
              <tbody>
                ${productsHTML}
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <div class="section-title">বিক্রয়ের তালিকা</div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>তারিখ</th>
                  <th>কাস্টমার</th>
                  <th style="text-align: center;">আইটেম</th>
                  <th style="text-align: right;">মূল্য</th>
                  <th style="text-align: right;">লাভ</th>
                </tr>
              </thead>
              <tbody>
                ${salesHTML}
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            ঘর তৈরির সরঞ্জাম সিস্টেম দ্বারা তৈরি 
            <br>
            ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
          </div>
        </body>
      </html>
    `;
  };
  
  const exportPDF = async () => {
    try {
      setLoading(true);
      
      // Create HTML for the PDF using the helper function
      const html = generatePdfHtml();
      
      // Create the PDF file
      const { uri } = await Print.printToFileAsync({ html });
      
      // Share the PDF
      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(uri);
      } else {
        // On Android, we need to copy to a shareable directory
        const pdfName = `report-${Date.now()}.pdf`;
        const destinationUri = FileSystem.documentDirectory + pdfName;
        await FileSystem.copyAsync({
          from: uri,
          to: destinationUri,
        });
        
        await Sharing.shareAsync(destinationUri);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      Alert.alert('Error', 'রিপোর্ট PDF তৈরি করতে সমস্যা হয়েছে।');
      setLoading(false);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>বিক্রয় রিপোর্ট</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={exportPDF}>
            <MaterialIcons name="picture-as-pdf" size={24} color="#d32f2f" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={shareReport}>
            <Ionicons name="share-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.reportTypeContainer}>
        <TouchableOpacity 
          style={[styles.reportTypeBtn, reportType === 'daily' && styles.activeReportType]} 
          onPress={() => setReportType('daily')}
        >
          <Text style={[styles.reportTypeText, reportType === 'daily' && styles.activeReportText]}>দৈনিক</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.reportTypeBtn, reportType === 'weekly' && styles.activeReportType]} 
          onPress={() => setReportType('weekly')}
        >
          <Text style={[styles.reportTypeText, reportType === 'weekly' && styles.activeReportText]}>সাপ্তাহিক</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.reportTypeBtn, reportType === 'monthly' && styles.activeReportType]} 
          onPress={() => setReportType('monthly')}
        >
          <Text style={[styles.reportTypeText, reportType === 'monthly' && styles.activeReportText]}>মাসিক</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.dateContainer}>
        <View style={styles.datePickerRow}>
          <Text style={styles.dateLabel}>শুরুর তারিখ:</Text>
          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text>{startDate.toLocaleDateString()}</Text>
            <AntDesign name="calendar" size={18} color="black" />
          </TouchableOpacity>
        </View>
        
        {reportType !== 'daily' && (
          <View style={styles.datePickerRow}>
            <Text style={styles.dateLabel}>শেষের তারিখ:</Text>
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Text>{endDate.toLocaleDateString()}</Text>
              <AntDesign name="calendar" size={18} color="black" />
            </TouchableOpacity>
          </View>
        )}
        
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={onStartDateChange}
          />
        )}
        
        {showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={onEndDateChange}
          />
        )}
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#0066cc" style={styles.loader} />
      ) : (
        <>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>মোট বিক্রয়</Text>
              <Text style={styles.summaryValue}>{totalSales} টাকা</Text>
            </View>
            
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>মোট লাভ</Text>
              <Text style={styles.summaryValue}>{totalProfit} টাকা</Text>
            </View>
            
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>মোট অর্ডার</Text>
              <Text style={styles.summaryValue}>{salesData.length}</Text>
            </View>
          </View>
          
          <LineChart data={chartData} labels={chartLabels} />
          
          <View style={styles.topProductsContainer}>
            <Text style={styles.topProductsTitle}>সর্বাধিক বিক্রিত পণ্য</Text>
            
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <View key={index} style={styles.topProductItem}>
                  <Text style={styles.topProductRank}>{index + 1}</Text>
                  <View style={styles.topProductDetails}>
                    <Text style={styles.topProductName}>{product.name}</Text>
                    <Text style={styles.topProductQuantity}>পরিমাণ: {product.quantity}</Text>
                  </View>
                  <Text style={styles.topProductRevenue}>{product.revenue} টাকা</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>এই সময়ে কোন বিক্রয় নেই</Text>
            )}
          </View>
          
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>বিক্রয়ের তালিকা</Text>
            
            {salesData.length > 0 ? (
              salesData.map((sale, index) => (
                <View key={index} style={styles.saleItem}>
                  <View style={styles.saleHeader}>
                    <Text style={styles.saleDate}>
                      {new Date(sale.date).toLocaleDateString()} {new Date(sale.date).toLocaleTimeString()}
                    </Text>
                    <Text style={styles.saleAmount}>{sale.totalAmount} টাকা</Text>
                  </View>
                  
                  <View style={styles.saleDetails}>
                    <Text>কাস্টমার: {sale.customerName || 'অজানা'}</Text>
                    <Text>পণ্য: {sale.items.length}টি</Text>
                    <Text>লাভ: {sale.totalProfit} টাকা</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>এই সময়ে কোন বিক্রয় নেই</Text>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 16,
  },
  reportTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    backgroundColor: '#fff',
    marginTop: 8,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  reportTypeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  reportTypeText: {
    fontSize: 15,
    fontWeight: '500',
  },
  activeReportType: {
    backgroundColor: '#0066cc',
  },
  activeReportText: {
    color: '#fff',
  },
  dateContainer: {
    backgroundColor: '#fff',
    marginTop: 8,
    marginHorizontal: 8,
    padding: 12,
    borderRadius: 8,
  },
  datePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  dateLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    gap: 8,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    marginTop: 8,
    marginHorizontal: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 40,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 16,
    marginHorizontal: 8,
    padding: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContent: {
    flexDirection: 'row',
    height: 200,
    alignItems: 'flex-end',
    marginHorizontal: 8,
    paddingRight: 8,
  },
  yAxis: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
    width: 40,
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#999',
    marginBottom: 4,
  },
  chartBars: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginLeft: 40,
    height: '100%',
  },
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  bar: {
    width: 24,
    height: 150,
    maxHeight: 150,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  barValue: {
    fontSize: 10,
    color: '#666',
    fontWeight: 'bold',
    marginTop: 5,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginLeft: 40,
  },
  xAxisLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    flex: 1,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  chartLabel: {
    fontSize: 12,
    color: '#666',
  },
  topProductsContainer: {
    backgroundColor: '#fff',
    marginTop: 16,
    marginHorizontal: 8,
    padding: 12,
    borderRadius: 8,
  },
  topProductsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  topProductItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  topProductRank: {
    width: 30,
    height: 30,
    backgroundColor: '#0066cc',
    color: '#fff',
    borderRadius: 15,
    textAlign: 'center',
    lineHeight: 30,
    marginRight: 10,
    fontWeight: 'bold',
  },
  topProductDetails: {
    flex: 1,
  },
  topProductName: {
    fontSize: 15,
    fontWeight: '500',
  },
  topProductQuantity: {
    color: '#666',
  },
  topProductRevenue: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  detailsContainer: {
    backgroundColor: '#fff',
    marginTop: 16,
    marginHorizontal: 8,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  saleItem: {
    marginVertical: 6,
    padding: 8,
    backgroundColor: '#f7f7f7',
    borderRadius: 6,
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  saleDate: {
    fontSize: 14,
  },
  saleAmount: {
    fontWeight: 'bold',
  },
  saleDetails: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 6,
    marginTop: 6,
  },
  noDataText: {
    textAlign: 'center',
    marginVertical: 20,
    color: '#666',
  },
});

export default ReportScreen;