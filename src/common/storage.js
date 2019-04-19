export function setItem(key, value, cb, err) {
    if (window.isApp) {
        NativeStorage.setItem(key,value, cb, err)
    } else {
        localStorage.setItem(key, value)
        if (cb) cb("success")
    }
}

export function getItem(key, cb, err) {
    if (window.isApp) {
        return new Promise(function(resolve, reject) {
            NativeStorage.getItem(key, (data) => resolve(data), (err) => reject(err))
        })
    } else {
        return Promise.resolve(localStorage.getItem(key))
    }
}

export function removeItem(key, cb, err) {
    if (window.isApp) {
        NativeStorage.remove(key, cb, err)
    }
    else {
        if (cb) {
            cb(localStorage.removeItem(key))
        } else {
            localStorage.removeItem(key)
        }
    }
}

export function clear(cb, err) {
    if (window.isApp) {
        NativeStorage.clear(cb, err)
    }
    else {
        if (cb) {
            cb(localStorage.clear())
        } else {
            localStorage.clear()
        }
    }
}
