// Netlify özel yapılandırması
module.exports = {
  onPreBuild: () => {
    console.log('=> Building Netlify Site');
  },
  onBuild: () => {
    console.log('=> Build completed');
  },
  onPostBuild: ({ utils }) => {
    // _redirects ve _headers dosyalarını build klasörüne kopyalama
    utils.status.show({
      title: 'Netlify Build',
      summary: 'Copying _redirects and _headers',
      text: 'Ensuring SPA routing works correctly'
    });

    // SPA uygulamaları için kritik öneme sahip
    const fs = require('fs');
    const path = require('path');

    // Eğer _redirects dosyası yoksa oluştur
    if (!fs.existsSync(path.join(__dirname, 'dist', '_redirects'))) {
      fs.writeFileSync(
        path.join(__dirname, 'dist', '_redirects'),
        '/* /index.html 200'
      );
      console.log('=> Created _redirects file for SPA routing');
    }
  }
}; 