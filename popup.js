document.addEventListener('DOMContentLoaded', function() {
    debugger;
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
        debugger;
      event.preventDefault();
  
      const productUrl = document.getElementById('product-url').value;
      const desiredPrice = parseFloat(document.getElementById('desired-price').value);
  
      chrome.storage.sync.get({ products: [] }, function(data) {
        const products = data.products;
        debugger;
  
        fetchProductData(productUrl)
          .then(productData => {

            console.log("product details",productData)
            products.push({ url: productUrl, desiredPrice: desiredPrice, currentPrice: productData.price, imageUrl: productData.imageUrl });
            chrome.storage.sync.set({ products: products }, function() {

              alert('Price tracking started!');
              loadProductList();
            });
          })
          .catch(error => {
            console.error('Error fetching product data:', error);
          });
      });
    });
  
    function fetchProductData(url) {
      return fetch(url)
        .then(response => response.text())
        .then(html => {
            debugger;

            console.log("html image",html);
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const priceElement = doc.querySelector('.a-price-whole').textContent;
          const imageElement = doc.querySelector('#imgTagWrapperId img');
  
          const price = priceElement ? parseFloat(priceElement.innerText.replace(/[^\d.]/g, '')) : null;
          const imageUrl = imageElement ? imageElement.src : 'Image not found';
  
          return { price, imageUrl };
        });
    }
  
    function loadProductList() {

        debugger;

      chrome.storage.sync.get({ products: [] }, function(data) {
        const productList = document.getElementById('product-list');
        productList.innerHTML = '';
  
        data.products.forEach(product => {
          const li = document.createElement('li');
          li.textContent = `URL: ${product.url}, Desired Price: $${product.desiredPrice}`;
          productList.appendChild(li);
  
          fetchProductData(product.url)
            .then(productData => {
              const price = productData.price;
              const imageUrl = productData.imageUrl;
  
              if (price !== null) {
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
  