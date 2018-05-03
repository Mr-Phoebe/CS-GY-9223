const yelp = require('yelp-fusion');
const fs = require('fs');
var sleep = require('co-sleep');
var co = require('co');

const apiKey = 'VdRz5pcdB3wKOEp6j15nHH_DBL-OBY3pv_wR667HEWdkwu4W3N_Ag0M2Ei702f3d5nhWy8t6InJNoIprHlliwLVjJicmkJG0WDWUPgj8mbX9lSfr6E3FY01TEEe6WnYx';
const client = yelp.client(apiKey);
var num = 0;

co(function*() {
    for (var i = 0; i < 20; i++) {
        yield sleep(1000);
        client.search({
            location: 'Inwood',
            radius: 40000,
            //price: 1,
            limit: 50,
            offset: i * 50
        }).then(response => {
            for (var j = 0; j < response.jsonBody.businesses.length; j++) {
                var data = response.jsonBody.businesses[j];
                var id = data.id;
                var name = data.name;
                var address = (data.location.display_address || ['', '']).join(" ").replace(',', '');
                var reviewcnt = data.review_count || 0;
                var rate = data.rating || 0.0;
                var price = (data.price || '').length;
                var phone = data.display_phone || '';
                var cuisine = '';
                if (data.categories.length != 0) {
                    cuisine = data.categories[0].title;
                }
                var str = `${id},${name},${address},${reviewcnt},${rate},${price},${phone},${cuisine},0\n`
                fs.writeFile('./FILE_1.csv', str, {
                    flag: 'a',
                    encoding: 'utf-8',
                    mode: '0666'
                }, function(err) {
                    if (err) {
                        console.log(i);
                        console.log("文件写入失败")
                        num = num + 1;
                    }
                })
            }
        }).catch(e => {
            console.log(i);
            console.log("抓取失败")
            console.log(e);
            num = num + 1;
        });
    }
    console.log('Finish');
    console.log('Missing ' + num);
})
