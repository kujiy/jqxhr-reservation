# jqxhr-reservation.js 
jQuery XHR reservation  
Japanese readme is here.[日本語のreadmeはこちら](./README_ja.md)

### Reduce your ajax requests and execute just the last one.
- All ajax requests should be reserved.
- The latest reservation will overwrite previous reservation.
- Any reservation will be executed when there is no working ajax.
- Callback after execute a reservation.
- Make reservation groups with each instance.(Overwriting reservation effects only each group)

***

## Summary


![](https://raw.githubusercontent.com/kujiy/jqxhr-reservation/master/sample/1127-03.png)

***

## What's great?
Last request precedes previous requests.


x first in, first out  
o first in, last out  


![](https://raw.githubusercontent.com/kujiy/jqxhr-reservation/master/sample/1127-00.png)


![](https://raw.githubusercontent.com/kujiy/jqxhr-reservation/master/sample/1127-01.png)

## Install

```bash
$ bower i jqxhr-reservation
```

## import

```html
<html>
<script src="jqxhr-reservation/src/jqxhr-reservation.js"></script>
```

## How to use

```js
<script>
// A box of reservations
var jqxhrReservation = new jqxhrReservation_company();

// A function to be reserved
function my_process(str) {

    jqxhrReservation.jqxhr = $.ajax({
                type: 'GET',
                url: url,
                data: data
            }).done( function(data) {
            }).fail( function(xhr) {
            }).always( function(data) {
                jqxhrReservation.finish(); //Necessary. This flag notifies that now you have time to execute the stacked reservation.
    }); //jqxhr
}

// Reserve your ajax request
jqxhrReservation.add(
    my_process, ["hoge"] ,{} // Execute when there is no working ajax request
);
```

# option


| key | desc | default |
|:---|:---|:---|
| delay| Drop requests within "delay" msec as duplicate.<br>\* Long delay setting will delay the first request because it needs to wait whether a next request will come or not.|500|
| priority | Shorten waiting time when the request reserves at the free time(while ajax not working)<br>For "delay" by percent(%)| 0.6 |
| timeout | Time by msec for aborting the reservation when there is no timing to execute an ajax request.<br>\* callback_failed execute at this time. |60000|

```js
var reserve_tabi_spot_list = new jqxhrReservation_company(
    {
        "delay": 500 // make reservations into a bunch
    }
);
```

***



## Advanced uses (callback)

| key | desc | default |
|:---|:---|:---|
| callback| will be fired after the request executed| none |
| callback_failed| will be fired when the request never executed| none |


```js
// make reservation
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
var reserve_group_a = new jqxhrReservation_company(); // Group A
var reserve_group_b = new jqxhrReservation_company(); // Group B

// your functions for reservations
function my_process1(str) {}
function my_process2(str) {}
function other_process1(str) {}
function other_process2(str) {}

// Do Reserve
// Group A
reserve_group_a.add( 
    my_process1, ["hoge"] ,{} // This will be canceled by next my_process2
);
reserve_group_a.add(
    my_process2, ["hoge"] ,{} // will be executed
);
// Group B
reserve_group_b.add(
    other_process1, ["hoge"] ,{} // This will be canceled by next other_process2
);
reserve_group_b.add(
    other_process2, ["hoge"] ,{} // will be executed
);

// Result
// my_process2 and other_process2 will be executed.

```

## Immediate function 

```js
<script>

// Group
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
[Reactive-Extensions/RxJS](https://github.com/Reactive-Extensions/RxJS)




# Welcome 
I'd like to know how you feel.

# License
MIT
