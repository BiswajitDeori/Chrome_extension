chrome.runtime.onInstalled.addListener(() => {
    debugger;
    chrome.alarms.create('checkPrice', { periodInMinutes: 1 });
  });
  
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'checkPrice') {
      checkPrice();
    }
  });
  
  function checkPrice() {

    debugger;
    chrome.storage.sync.get({ products: [] }, (data) => {
        debugger;
      data.products.forEach((product, index) => {
        fetch(product.url)
          .then(response => response.text())
          .then(html => {
           
            const price = extractPrice(html);

            if (price) { 
              const Imageurl = extractImageUrl(html);
            
              if (price <= product.desiredPrice) {
                chrome.notifications.create(`priceAlert-${index}`, {
                  type: 'basic',
                  iconUrl: Imageurl,
                  title: 'Price Alert',
                  message: `The price of your tracked product is now $${price}!`
                });
              }
            }
          })
          .catch(error => console.error('Error fetching product page:', error));
      });
    });
  }
  

  function extractPrice(html) {
    // Regular expression to match the price inside the element with class "a-price-whole"
    const priceRegex = /class="a-price-whole"[^>]*>([\d,.]+)<\/span>/;
    const match = html.match(priceRegex);
    
    if (match && match[1]) {
      // Remove any commas and convert to a number
      const priceText = match[1].replace(/,/g, '');
      return parseFloat(priceText);
    }
    
    return null;
  }

  function extractImageUrl(html) {
    // Regular expression to match the src attribute of the img tag within the element with ID imgTagWrapperId
    const imageRegex = /id="imgTagWrapperId"[^>]*>[^<]*<img[^>]*src="([^"]*)"/;
    const match = html.match(imageRegex);
    
    if (match && match[1]) {
      return match[1]; // Return the URL of the image
    }
    
    return 'Image not found'; // Default message if image URL is not found
  }