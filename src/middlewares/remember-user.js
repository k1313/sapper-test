import cookie from 'cookie';
import {v4 as uuid} from 'uuid';
import {initUserCollection} from "../api";

const KEY = "testTaskCookie";

export async function rememberUser(req, res, next) {
    let cookies = cookie.parse(req.headers.cookie || '');
    if (!cookies[KEY]) {
        let id = uuid();
        res.setHeader('Set-Cookie', cookie.serialize(KEY, id, {
            // httpOnly: true,
            maxAge: 60 * 60 * 24 * 365
        }));
        req.userId = id;
        req.newUser = true;
        await initUserCollection(id);
    } else {
        req.userId = cookies[KEY];
        req.newUser = false;
    }
    next();

}