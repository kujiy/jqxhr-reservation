# jqxhr-reservation.js

## ajaxの連続リクエストを抑止し、最後のリクエストだけを実行します
- すべてのリクエストは予約される
- 予約時に、前の予約があった場合は上書きする
- 空きがあれば実行される
- 実行時のコールバックあり
- インスタンスごとに、別々の予約グループを作れる（グループごとに予約の上書きが行われる）

***

## 概要


![](https://raw.githubusercontent.com/kujiy/jqxhr-reservation/master/sample/1127-03.png)
***

## 何がすごいか
**後から呼ばれた方を優先できる**点が特徴です。  


x first in, first out  
o first in, last out  

![](https://raw.githubusercontent.com/kujiy/jqxhr-reservation/master/sample/1127-00.png)


![](https://raw.githubusercontent.com/kujiy/jqxhr-reservation/master/sample/1127-01.png)

## import

```html
<html>
<script src="jqxhr-reservation/src/jqxhr-reservation.js"></script>
```

## How to use

```js
<script>
// 予約の入れ物
var jqxhrReservation = new jqxhrReservation_company();

// 予約登録したい関数
function my_process(str) {

    jqxhrReservation.jqxhr = $.ajax({
                type: 'GET',
                url: url,
                data: data
            }).done( function(data) {
            }).fail( function(xhr) {
            }).always( function(data) {
                jqxhrReservation.finish(); //Necessary. リクエスト終了を通知するフラグです
    }); //jqxhr
}

// 予約登録
jqxhrReservation.add(
    my_process, ["hoge"] ,{} // 空きがあれば my_process() が実行される
);
```

# option


| key | desc | default |
|:---|:---|:---|
| delay| 何msec以内のリクエストを重複として切り捨てるか<br>※長くするほど初回のリクエスト処理も遅くなります<br>（次のリクエストが来るかどうか待つため）|500|
| priority | リクエストに空きがある時にリクエストが来た場合、待ち時間を少し短くする<br>"delay"に対する%で指定 | 0.6 |
| timeout | リクエストの空きがない場合、諦める時間<br>※callback_failedを実行する時間 |60000|

```js
var reserve_tabi_spot_list = new jqxhrReservation_company(
    {
        "delay": 500 //500msec以内に来た同時リクエストを１つに丸める
    }
);
```

***



## Advanced uses (callback)

| key | desc | default |
|:---|:---|:---|
| callback| 予約実行されたら実行される| none |
| callback_failed| 何らかの原因で予約がいつまで経っても実行されない場合に実行される| none |


```js
// 予約登録
jqxhrReservation.add(
    my_process, [] ,{
            callback: function(result) {
                $("#use2").append("callback fired.");
            },
            callback_failed: function(result) {
                $("#use2").append("callback_error fired.");
            },
    }
);
```

## Advanced uses (make a group of requests)

```js
// two instances
var reserve_group_a = new jqxhrReservation_company(); //グループA
var reserve_group_b = new jqxhrReservation_company(); //グループB

// your functions for reservations
function my_process1(str) {}
function my_process2(str) {}
function other_process1(str) {}
function other_process2(str) {}

// Do Reserve
// Group A
reserve_group_a.add( 
    my_process1, ["hoge"] ,{} // 次のmy_process2でキャンセルされる
);
reserve_group_a.add(
    my_process2, ["hoge"] ,{} // 実行される
);
// Group B
reserve_group_b.add(
    other_process1, ["hoge"] ,{} // 次のother_process2でキャンセルされる
);
reserve_group_b.add(
    other_process2, ["hoge"] ,{} // 実行される
);

// 結果
// my_process2 and other_process2 will be executed.

```

## Immediate function 

```js
<script>

// グループ
var jqxhrReservation = new jqxhrReservation_company();
jqxhrReservation.add(
    (function(){
        console.log("My immediate function was fired.");
    }())
    ,    []
    ,    {}
);

</script>
```


## Known issues

- You can't reserve your method of an object.
- It allows to reserve just functions.

## Want more
If you want more features, try this.  
(Reactive-Extensions/RxJS)[https://github.com/Reactive-Extensions/RxJS]




# Welcome 
I'd like to know how you feel.

# License
MIT
