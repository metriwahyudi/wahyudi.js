/***
 * Created by Metri Wahyudi
 * At 10.10.2019
 * https://metri.wahyudi.net
 */
class wahyudi{
    // Base Url
    url = location.href;
    // Verb, Request method
    type = 'get';
    // Data that to be send
    data = {};
    // Header
    headers = {};

    options = {
        ignoreResponseInError:true,
        messageEl:'.message',
        contentEl:null
    };
    callbacks = {
        httpStatus:[],
        error:null,
        success:null,
        loading:[null,null]
    };
    storedResponse = {};

    /***
     * Constructor
     * @param options
     */
    constructor(options = {}){

        this.options = $.extend(this.options,options);
        if(this.options.hasOwnProperty('url')){
            this.url = this.options.url;
            delete this.options.url;
        }
        if(this.options.hasOwnProperty('type')){
            this.url = this.options.type;
            delete this.options.type;
        }
        if(this.options.hasOwnProperty('data')){
            this.url = this.options.data;
            delete this.options.data;
        }
    }

    /**
     * Sending some data
     * @param data
     */
    send(data = null){
        if(data){
            this.data = data;
        }
        this.execute();
    }

    /**
     * Set callback when got selected http status
     * @param func
     * @param status
     * @returns {control}
     */
    onHttpStatus(func,status = 200){
        this.callbacks.httpStatus[status] = func;
        return this;
    }

    /**
     * Set callback when error
     *
     * @param func
     * @returns {control}
     */
    onError(func){
        this.callbacks.error = func;
        return this;
    }

    /**
     * Set callback when success
     * @param func
     * @returns {control}
     */
    onSuccess(func){
        this.callbacks.success = func;
        return this;
    }

    /**
     * Set callback when loading start
     *
     * @param func
     * @returns {control}
     */
    onLoadingStart(func) {
        this.callbacks.loading[0] = func;
        return this;
    }

    /**
     * Set callback when loading end
     *
     * @param func
     * @returns {control}
     */
    onLoadingEnd(func){
        this.callbacks.loading[1] = func;
        return this;
    }

    /**
     * Callback handler, will run some callback if exists
     * @param func
     * @param param
     */
    runCallback(func,param){
        if(typeof func === "function"){
            func(param);
        }
    }

    /**
     * Http Status Callback handler, run callback in selected HTTP Status Code
     * @param status
     * @param param
     */
    runHttpStatusCallbacks(status,param){
        if(this.callbacks.httpStatus.hasOwnProperty(status)){
            if (typeof this.callbacks.httpStatus.hasOwnProperty(status) === 'function'){
                this.callbacks.httpStatus[status](param);
            }
        }
    }

    /**
     * Loading, set true for start and false for end
     * @param start
     * @returns {boolean}
     */
    loading(start){
        if(start) {
            console.log('Loading..');
            this.runCallback(this.callbacks.loading[0]);
        }else{
            console.log('Stop Loading');
            this.runCallback(this.callbacks.loading[1]);
        }
        return true;
    }

    /**
     * Success response handler
     * @param d
     */
    success(d){
        this.loading(false);
        console.log('SUCCESS');
        this.response(d);
        this.runCallback(this.callbacks.success,d);
        this.runHttpStatusCallbacks(200,d);
    }

    /**
     * Error response handler
     * @param e
     */
    error(e){
        this.loading(false);
        console.log('ERROR');
        console.log(e);
        if(!this.options.ignoreResponseInError){
            this.response(e.responseJSON);
        }
        this.runCallback(this.callbacks.error,e);
        this.runHttpStatusCallbacks(e.status,e);
    }

    /**
     * Execute xmlHttpRequest whit jQuery AJAX
     */
    execute(){
        $.ajax({
            url:this.url,
            type:this.type,
            data:this.data,
            headers:this.headers,
            beforeSend:() => this.loading(true),
            success:(d) => this.success(d),
            error:(e) => this.error(e),
        });
    }

    /**
     * Response Handler
     * @param d
     */
    response(d){
        for(let handler in this.registeredResponseHandler){
            if(this.registeredResponseHandler.hasOwnProperty(handler)){
                if(handler !== 'getItem' && handler !== 'getOption'){
                    if(d.hasOwnProperty(handler)){
                        this.registeredResponseHandler[handler](d[handler]);
                    }
                }
            }
        }
    }

    /**
     * Retrieving stored response(if response data in Object/Array)
     * @param key
     * @returns {null|*}
     */
    getResponseItem(key){
        if(this.storedResponse.hasOwnProperty(key)){
            return this.storedResponse[key];
        }
        return null;
    }

    /**
     * Retrieving stored options
     * @param key
     * @returns {null|*}
     */
    getOptions(key){
        if(this.options.hasOwnProperty(key)){
            return this.storedResponse[key];
        }
        return null;
    }
    addHeaders(headers){
        this.headers = $.extend(this.headers,headers);
        return this;
    }
    removeHeader(headers){
        if(this.headers.hasOwnProperty(headers)){
            delete this.headers[headers];
        }
        return this;
    }
    /**
     * Response handler register, Will run as callback base on given name(key)
     * that related with JSON http response
     *
     * @string name
     * @function func
     * @boolean replace
     */
    addHandler(name,func,replace = false){
        if(name !== 'getItem' && name !== 'getOption' && typeof func === 'function'){
            if(replace) {
                this.registeredResponseHandler[name] = func;
            }else {
                if(!this.registeredResponseHandler.hasOwnProperty(name)){
                    this.registeredResponseHandler[name] = func;
                }
            }
        }
    }

    /**
     * Removing response handler by name(key)
     * @param name
     */
    removeHandler(name){
        if(name !== 'getItem' && name !== 'getOption'){
            delete this.registeredResponseHandler[name];
        }
    }

    /**
     * Stored Response Handler, with some default response callback
     */

    registeredResponseHandler = {
        getItem:(key) => this.getResponseItem(key),
        getOption:(key) => this.getOptions(key),
        // ModNode
        MN(obj){
            for(let k in obj){
                if(obj.hasOwnProperty(k)){
                    let e = $(k);
                    if(obj[k].html){
                        e.html(obj[k].html);
                    }
                    if(obj[k].class){
                        e.addClass(obj[k].class);
                    }
                    if(obj[k].del){
                        e.remove();
                    }
                    if(obj[k].empty){
                        e.val("");
                    }
                    if(obj[k].value){
                        e.val(obj[k].value);
                    }
                    if(obj[k].rmClass){
                        e.removeClass(obj[k].rmClass);
                    }
                    if(obj[k].attr){
                        let o2 = obj[k].attr;
                        for(var q in o2){
                            if(o2.hasOwnProperty(q)){
                                e.attr(q,o2[q]);
                            }
                        }
                    }
                    if(obj[k].action){
                        if(obj[k].action === "focus"){
                            e.focus();
                        }
                        if(obj[k].action === "blur"){
                            e.blur();
                        }
                        if(obj[k].action === "click"){
                            e.click();
                        }
                    }
                    if(k === 'rm'){
                        eval(obj[k]);
                    }
                    if(obj[k].hasOwnProperty('func')){

                        if(obj[k].func.hasOwnProperty('method') && obj[k].func.hasOwnProperty('arg')){
                            eval(obj[k].func.method)(obj[k].func.arg);
                        }
                    }
                    if(k === 'redirect'){
                        if(obj[k].hasOwnProperty('target') && obj[k].hasOwnProperty('url')){
                            window.open(obj[k].target,obj[k].url);
                        }else{
                            window.open(obj[k],'_self');
                        }
                    }
                }
            }
        },
        func(d){
            if(d.hasOwnProperty('method') && d.hasOwnProperty('arg')){
                eval(d.method)(d.arg);
            }
        },
        status(status){
            let notif = ['error','success','danger','warning','info'];
            let message = this.getItem('message');

            if(this.getItem("silent")){
                return false;
            }

            let messageEl = this.getOption('messageEl');
            for(let i in notif){
                if(notif.hasOwnProperty(i)) {
                    if (notif[i] === status) {
                        status = status === 'error' ? 'danger' : status;
                        $(messageEl).html('<div class="alert alert-'+status+'"><a href="#" class="close" data-dismiss="alert">&times;</a>'+message+'</div>');
                    }
                }
            }
        },
        redirect(redirect){
            window.location = redirect;
        },
        content(content){
            let contentEl = this.getOption('contentEl');
            $(contentEl).html(content);
        }
    }
}
