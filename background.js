chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('checkPrice', { periodInMinutes: 60 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkPrice') {
      checkPrice();
  }
});

function checkPrice() {
  chrome.storage.sync.get({ products: [] }, (data) => {
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
                              message: `The price of your tracked product is now Rs${price}!`,
                              contextMessage: product.url
                          });
                      }
                  }
              })
              .catch(error => console.error('Error fetching product page:', error));
      });
  });
}

function extractPrice(html) {
  const priceRegex = /class="a-price-whole"[^>]*>([\d,.]+)<\/span>/;
  const match = html.match(priceRegex);

  if (match && match[1]) {
      const priceText = match[1].replace(/,/g, '');
      return parseFloat(priceText);
  }

  return null;
}

function extractImageUrl(html) {
  const imageRegex = /id="imgTagWrapperId"[^>]*>[^<]*<img[^>]*src="([^"]*)"/;
  const match = html.match(imageRegex);

  if (match && match[1]) {
      return match[1];
  }

  return 'Image not found';
}

chrome.notifications.onClicked.addListener((notificationId) => {
  const index = parseInt(notificationId.split('-')[1], 10);
  chrome.storage.sync.get({ products: [] }, (data) => {
      const product = data.products[index];
      if (product) {
          chrome.tabs.create({ url: product.url });
      }
  });
});
