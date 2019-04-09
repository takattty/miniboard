const http = require('http');
const fs = require('fs');
const ejs = require('ejs');
const url = require('url');
const qs = require('querystring');

const index_page = fs.readFileSync('./index.ejs', 'utf8');
const login_page = fs.readFileSync('./login.ejs', 'utf8');
const style_css = fs.readFileSync('./style.css', 'utf8');

const max_num = 10 //最大保管料
const filename = 'mydata.txt';
var message_data;
readFromFile(filename);

var server = http.createServer(getFromClient);

server.listen(3000);
console.log('Server start!!!!!!!!!!!!!!');

//ここまでメインプログラム
//createServerの処理

function getFromClient(request, response) {
    var url_parts = url.parse(request.url, true);
    switch (url_parts.pathname) {
        case '/'://トップページ（掲示板）
            response_index(request, response);
            break;

        case '/login'://ログインページ
            response_login(request, response);
            break;

        case '/style.css':
            response.writeHead(200, {'Content-Type': 'text/css'});
            response.write(style_css);
            response.end();
            break;

        default:
            response.writeHead(200, {'Content-Type': 'text/plain'});
            response.end('end page....');
            break;
    }
}

//loginアクセス処理
function response_login(request, response) {
    var content = ejs.render(login_page, {});//login.ejsのテンプレの変数を使っている。レンダリングし、変数に代入。空の引数を作ってる。
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write(content);//引数出力。
    response.end();
}

//indexのアクセス処理
function response_index(request, response) {
    //POSTアクセス時の処理
    if (request.method == 'POST') {
        var body = '';//bodyの空配列を作成。

        //データ受信のイベント処理
        request.on('data', function(data) {//dataのイベント発生時にデータを保存する。
            body += data;//変数bodyにデータを入れて行く。
        });

        //データ受信終了のイベント処理
        request.on('end', function() {//endのイベント発生。イベント終了。
            data = qs.parse(body);//bodyに入っているデータをparseして変数に扱えるようにエンコードして代入。
            addToData(data.id, data.msg, filename, request);//parseで各要素に分解したデータをそれぞれで引き出して行く。
            write_index(request, response);
        });
    } else {
        write_index(request, response);
    }
}

//indexのページ作成
function write_index(request, response) {
    var msg = "＊何かメッセージを書いてください。";
    var content = ejs.render(index_page, {//renderが何か思い出せない。HTMLのタグをもう少し調べて見る。
        title:'Index',
        content:msg,
        data:message_data,
        filename:'data_item',
    });//この4つのデータもレンダリングしてるのかな。
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write(content);
    response.end();
}

//テキストファイルをロード
function readFromFile(fname) {
    fs.readFile(fname, 'utf8', (err, data) => {
        message_data = data.split('/n');//splitがなんだっけ。データをどうにか処理するんだはず。それを変数に代入。
    })
}

//データを更新
function addToData(id, msg, fname, request) {
    var obj = {'id': id, 'msg': msg};// オブジェクトを作成。オブジェクトは車のイメージ。関数や処理が1つにまとまっている。それをオブジェクトという単位で見る。
    var obj_str = JSON.stringify(obj);//JSON形式のオブジェクトにエンコードする。そうするとのちの処理で使えるようになる。なぜ2回もしてるのかな？
    console.log('add data: ' + obj_str);//コンソール画面に表示。変数は、キーと値のペアで保存されている。
    message_data.unshift(obj_str);
    if(message_data.length > max_num){
        message_data.pop();
    }
    saveToFile(fname);
}

//データを保存
function saveToFile(fname) {
    var data_str = message_data.join('/n');
    fs.writeFile(fname, data_str, (err) => {
        if (err) { throw err; } 
    });
}