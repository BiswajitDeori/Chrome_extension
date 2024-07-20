document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
  
    tabs.forEach(tab => {
      tab.addEventListener('click', function() {
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(tc => tc.classList.remove('active'));
  
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
      });
    });
  
    document.getElementById('price-tracker-form').addEventListener('submit', function(event) {
      event.preventDefault();
      
      const productUrl = document.getElementById('product-url').value;
      const desiredPrice = parseFloat(document.getElementById('desired-price').value);
      
      chrome.storage.sync.get({ products: [] }, function(data) {
        const products = data.products;
  
        chrome.tabs.create({ url: productUrl, active: false }, function(tab) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: getProductData
          }, (results) => {
            const productData = results[0].result;
            products.push({ url: productUrl, desiredPrice: desiredPrice, currentPrice: productData.price, imageUrl: productData.imageUrl });
            chrome.storage.sync.set({ products: products }, function() {
              alert('Price tracking started!');
              loadProductList();
              chrome.tabs.remove(tab.id);
            });
          });
        });
      });
    });
  
    function getProductData() {
      const priceElement = document.querySelector('#priceblock_ourprice, #priceblock_dealprice');
      const imageElement = document.querySelector('#imgTagWrapperId img');
  
      const price = priceElement ? parseFloat(priceElement.innerText.replace(/[^\d.]/g, '')) : null;
      const imageUrl = imageElement ? imageElement.src : 'Image not found';
  
      return { price, imageUrl };
    }
  
    function loadProductList() {
      chrome.storage.sync.get({ products: [] }, function(data) {
        const productList = document.getElementById('product-list');
        productList.innerHTML = '';
  
        data.products.forEach(product => {
          const li = document.createElement('li');
          li.textContent = `URL: ${product.url}, Desired Price: $${product.desiredPrice}`;
          productList.appendChild(li);
  
          fetch(product.url)
            .then(response => response.text())
            .then(html => {
              const parser = new DOMParser();
              const doc = parser.parseFromString(html, 'text/html');
              const priceElement = doc.querySelector('#priceblock_ourprice, #priceblock_dealprice');
              const imageElement = doc.querySelector('#imgTagWrapperId img');
              
              if (priceElement) {
                const price = parseFloat(priceElement.innerText.replace(/[^\d.]/g, ''));
                const imageUrl = imageElement ? imageElement.src : 'Image not found';
  
                li.textContent += `, Current Price: $${price}`;
                li.innerHTML += `<br><img src="${imageUrl}" alt="Product Image">`;
              } else {
                li.textContent += `, Current Price: Not Available`;
              }
            })
            .catch(error => {
              li.textContent += `, Current Price: Error`;
              console.error('Error fetching product price:', error);
            });
        });
      });
    }
  
    loadProductList();
  });
  