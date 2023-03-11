let handleError = null;

export default {
    foo(fn) {
        callWithErrorHanding(fn);
    },
    // 用户可以调用该函数注册统一的错误处理函数
    registerErrorHandler(fn) {
        handleError = fn;
    }
}

function callWithErrorHanding(fn) {
    try {
        fn && fn()
    } catch (e) {
        // 将捕获到的错误传递给用户的错误处理程序
        handleError(e)
    }
}