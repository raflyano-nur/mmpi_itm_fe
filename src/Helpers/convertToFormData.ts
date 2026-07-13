const convertToFormData = (data: any): string => {
  const formData = new URLSearchParams();
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    
    if (value !== null && value !== undefined && value !== '') {
      // Jika value adalah object atau array, convert ke JSON string
      if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value.toString());
      }
    }
  });
  
  return formData.toString();
};
