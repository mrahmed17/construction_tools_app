const exportPdf = async () => {
  try {
    const html = generatePdfHtml();
    const { uri } = await Print.printToFileAsync({ html });
    
    if (!uri) {
      throw new Error('Failed to generate PDF: URI is undefined');
    }
    
    await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
  } catch (error) {
    console.error('Error exporting PDF:', error);
    Alert.alert('Error', 'Failed to export PDF. Please try again.');
  }
};