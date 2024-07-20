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

      document.getElementById('price_submit').hidden = true;
      document.getElementById('loader').hidden = false;

      const productUrl = document.getElementById('product-url').value;
      const desiredPrice = parseFloat(document.getElementById('desired-price').value);
  
      chrome.storage.sync.get({ products: [] }, function(data) {
        const products = data.products;
        debugger;
  
        fetchProductData(productUrl)
          .then(productData => {

            console.log("product details",productData)
            products.push({ url: productUrl, desiredPrice: desiredPrice, currentPrice: productData.price, imageUrl: productData.imageUrl ,productName:productData.Name });
            chrome.storage.sync.set({ products: products }, function() {

              
            document.getElementById('price_submit').hidden = false;
            document.getElementById('loader').hidden = true;

            document.getElementById('added_message').hidden=false;

            setTimeout(() => {
                document.getElementById('added_message').hidden = true;
              }, 2000); // 2000 milliseconds = 2 seconds
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

          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const Name  =  doc.querySelector('#productTitle').textContent;
          const priceElement = doc.querySelector('.a-price-whole');
          const imageElement = doc.querySelector('#imgTagWrapperId img');
  
          const price = priceElement ? parseFloat(priceElement.innerText.replace(/[^\d.]/g, '')) : null;
          const imageUrl = imageElement ? imageElement.src : 'Image not found';
  
          return { Name,price, imageUrl };
        });
    }
  
    function loadProductList() {

      chrome.storage.sync.get({ products: [] }, function(data) {
        debugger;
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
  