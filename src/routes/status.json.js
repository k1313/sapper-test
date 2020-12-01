import {getItemsTotalCount} from '../api';
import send from '@polka/send-type';

export async function get(req, res) {
    send(res, 200, {total: await getItemsTotalCount(), userId: req.userId, newUser: req.newUser});
}