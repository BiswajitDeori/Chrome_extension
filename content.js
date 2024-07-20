chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getProductData') {
      const priceElement = document.querySelector('#priceblock_ourprice, #priceblock_dealprice');
      const imageElement = document.querySelector('#imgTagWrapperId img');
  
      const price = priceElement ? parseFloat(priceElement.innerText.replace(/[^\d.]/g, '')) : null;
      const imageUrl = imageElement ? imageElement.src : 'Image not found';
  
      sendResponse({ price, imageUrl });
    }
  });
  