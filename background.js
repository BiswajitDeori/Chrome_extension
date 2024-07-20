// chrome.runtime.onInstalled.addListener(() => {
//     chrome.alarms.create('checkPrice', { periodInMinutes: 60 });
//   });
  
//   chrome.alarms.onAlarm.addListener((alarm) => {
//     if (alarm.name === 'checkPrice') {
//       checkPrice();
//     }
//   });
  
//   function checkPrice() {

//     debugger;
//     chrome.storage.sync.get({ products: [] }, (data) => {
//         debugger;
//       data.products.forEach((product, index) => {
//         fetch(product.url)
//           .then(response => response.text())
//           .then(html => {
//             debugger;
//             const parser = new DOMParser();
//             const doc = parser.parseFromString(html, 'text/html');
//             const priceElement = doc.querySelector('#priceblock_ourprice, #priceblock_dealprice');
//             const imageElement = doc.querySelector('#imgTagWrapperId img');
  
//             if (priceElement) {
//               const price = parseFloat(priceElement.innerText.replace(/[^\d.]/g, ''));
//               const imageUrl = imageElement ? imageElement.src : 'Image not found';
  
//               if (price <= product.desiredPrice) {
//                 chrome.notifications.create(`priceAlert-${index}`, {
//                   type: 'basic',
//                   iconUrl: imageUrl,
//                   title: 'Price Alert',
//                   message: `The price of your tracked product is now $${price}!`
//                 });
//               }
//             }
//           })
//           .catch(error => console.error('Error fetching product page:', error));
//       });
//     });
//   }
  