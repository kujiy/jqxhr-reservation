/**
 * ///////////////////////////////////////////////////////////////////
 *
 * jqxhr-reservation.js
 * @author kujiy
 * @url https://github.com/kujiy/jqxhr-reservation
 *
 * @class      jqxhrReservation_company
 *
 * A company for $.ajax requests.
 *
 * There are a couple of department.
 *
 * [1] jqxhrReservation_company.[add|finish]
 * Reservation information.
 * Reserve your request with a function, arguments and callbacks.
 * It gets the notification of finishing the ajax proccess.
 *
 * [2] jqxhrReservation_company.[other_methods]
 * Proccess of the inner company.
 * Execute a reservation when ajax is free.
 * Make waiting a reservation when ajax is working.
 * If the reservation has a callback, execute it.
 *
 * @constructor
 * @author kujiy
 * @date        2015-11-24T11:14:08+0900
 * @class  jqxhrReservation_company
 *
 * @method add      [1-1] [To customer] reservation information
 * @method finish   [1-2] [To customer] Get notification of ajax free time
 * @method inquiry  [2-1] [Terminal] Confirm reservation(Execute or keep waiting)
 * @method cancel   [2-2] Cancel the reserved/waited a reservations
 * @method execute  [2-3] [Work dept.] Execute waited a reservation
 * @method failed   [2-4] [Special dept.] Proccess after timeout
 * @method exec_callback [2-5] [Support dept.] Execute callbacks when gets calling from other dept.
 *
 * @return      {[none]}                 [none]
 *
 *
 * ///////////////////////////////////////////////////////////////////
 */

var jqxhrReservation_company = function( options ) {

    // default options.
    this.settings = $.extend( {
        "priority": 0.6,
        "delay": 500,
        "timeout": 60000,
    }, options );

    // Flag of request / requesting=1, working=0
    this.jqxhr = 0;
    // Object for keeping a reservation
    this.reservation = [];
    // Error flag (will be set when the ajax request never finish etc.)
    this.failed = 0;

    return this;

};

/**
 * [1-1] reservation information
 * @method jqxhrReservation_company.prototype.add
 *
 * - All requests should be reserved. You must reserve it with this method.
 * - New reservation will always overwrite old reservation.
 *
 * @constructor
 * @author kuji
 * @date        2015-11-24T11:10:57+0900
 * @param       {[Function]}    func [Function for reservation]
 * @param       {[array]}     args     [args for reserved function]
 * @param       {[object]}    opt      [reserved
 *                                     callback:will be executed after ajax is succeeded or
 *                                     callback_failed:will be executed after timeout]
 *
 * ex.) jqxhrReservation.add("logoutSuccessTest",[64,96,211,"test"],{
 *          callback : function (result){
 *              // execute after get success
 *          },
 *          callback_failed : function {
 *              // execute after timeout
 *          }
 *      })
 *
 * *Any reservation will be deleted when callback_failed is executed.
 *
 * @return      {[boolean]}                          always true
 */
jqxhrReservation_company.prototype.add = function( func, args, opt ) {
// Reserve a function (Always overwrite previous reservation)
this.reservation = arguments;

// Inquiry reservation status
this.inquiry();

return true;
};

/**
 * [1-2] [To customer] Get notification of ajax free time
 *
 * @method      finish
 * @constructor
 * @author kuji
 * @date        2015-11-25T18:46:24+0900
 */
jqxhrReservation_company.prototype.finish = function() {
// unset the "now requesting" flag
this.jqxhr = 0;
};


/**
 * [2-1] [Terminal] Confirm reservation(Execute or keep waiting)
 * @method  jqxhrReservation_company.prototype.inquiry
 *
 * - Check jqxhr is exist or not every "delay" msec.
 * - jqxhr isn't exist -> Execute reservation
 * - jqxhr is exist -> Wait and call ownself recursively until previous ajax is finished.
 *
 * *REMARKS:
 * - Any reservation is fired after some waits.
 *   (Whether next request will come.
 *    This library make every effort to execute only the last request(To reduce server loads).
 */
jqxhrReservation_company.prototype.inquiry = function() {
var self = this; // To call "this" from the inner of immediate functions.
self.cancel();
var timeout = self.settings.timeout;
var delay = self.settings.delay; // Interval of wainting times for request（msec)

// Check there is an ajax request is working or not
if ( !self.jqxhr ) {
    /**
     * Shorten the waiting time when ajax is free.
     * Don't set zero due to it causes multiple requests.
     * BECAUSE: You must wait somewhile to know whether a next request will come or not.
     */
    delay = delay * self.settings.priority; // 500msec delay -> 300msec for the first request
}

// Check ajax status every "delay" msec
self.timer = setInterval( function() {
    if ( timeout > 0 ) {
        if ( self.jqxhr ) {
            // c( "waiting" );
        } else {
            // When ajax is in idle
            self.execute();
        }
    } else {
        // When ajax never get free
        self.failed();
    }
    timeout -= delay;
// c( timeout );
}, delay );
};
/**
 * [2-2] Cancel the reserved/waited a reservations
 * @method      cancel
 * @constructor
 * @author kuji
 * @date        2015-11-25T14:45:20+0900
 */
jqxhrReservation_company.prototype.cancel = function() {
// c( this.timer );
clearInterval( this.timer );
};
/**
 * [2-3] [Work dept.] Execute waited a reservation
 * @method      execute
 * @constructor
 * @author kuji
 * @date        2015-11-25T14:45:02+0900
 */
jqxhrReservation_company.prototype.execute = function() {
/**
 * Execute a function what is defered by .add/.inquiry
 * Execute it after check the reservation is empty or not.(An empty request comes sometimes?)
 */
if ( this.reservation[ 0 ] ) {

    this.jqxhr = 1; // set a flag of "Now requesting"
    // cancel a reservation
    this.cancel();

    // Execute the reserved function
    var func = this.reservation[ 0 ];
    var args = this.reservation[ 1 ];
    func.apply( null, args );

    // Execute normal callback
    this.exec_callback( this.reservation );

    this.finish();

    return false;

}
this.reservation = [];
};
/**
 * [2-4] [Special dept.] Proccess after timeout
 * @method      failed
 * @constructor
 * @author kuji
 * @date        2015-11-25T14:44:37+0900
 */
jqxhrReservation_company.prototype.failed = function() {

// set an error flag
this.failed = 1;

// cancel exist reservation
this.cancel();

//Fire the callback for jqxhr-reservation failed
this.exec_callback( this.reservation );

return false;

};
/**
 * [2-5] [Support dept.] Execute callbacks when gets calling from other dept.
 * @method      exec_callback
 * @date        2015-11-25T14:43:11+0900
 * @param       {[object]}                 reservation [str Func, array args, obj callback]
 * @return      {[none]}                                no return
 */
jqxhrReservation_company.prototype.exec_callback = function( reservation ) {
var opt = reservation[ 2 ];
if ( opt ) {
    var func = this.reservation[ 0 ];
    var args = this.reservation[ 1 ];

    // それぞれ実行
    if ( opt.callback ) {
        opt.callback( func, args, opt );
    }
    if ( this.failed && opt.callback_failed ) {
        opt.callback_failed( func, args, opt );
        this.failed = 0;
    }
}
};


/**
 * [3-1] [User] Make instances
 * You can make a instance for a group which shares ajax request into one request.
 * e.g.)
 * [1] Clicking a menu and [2] Clicking a tab are the same request of your API,
 * you should use one instance for them.
 *  -> [2] is called while [1] is reserved, [2] is able to cancel [1].
 *
 * Example:
 * var jqxhrReservation = new jqxhrReservation_company();
 *
 */

// jqxhr-reservation Classes <=
//------------------------------------------------------
