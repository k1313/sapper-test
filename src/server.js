require('dotenv').config();
import sirv from 'sirv';
import polka from 'polka';
import compression from 'compression';
import * as sapper from '@sapper/server';
import {rememberUser} from "./middlewares/remember-user";
import {preload} from './api';
import {json} from 'body-parser';

const {PORT, NODE_ENV, KEY} = process.env;
const dev = NODE_ENV === 'development';

preload().catch(console.error);

polka() // You can also use Express
    .use(
        compression({threshold: 0}),
        rememberUser,
        sirv('static', {dev}),
        json(),
        sapper.middleware({
            session: (req, res) => {
                return {
                    userId: req.userId,
                    newUser: req.newUser,
                }
            }
        })
    )
    .listen(PORT, err => {
        if (err) console.log('error', err);
    })
