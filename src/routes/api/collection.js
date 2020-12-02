import send from '@polka/send-type';
import {
    createNewCollection,
    deleteFromUserCollection,
    getMoreItems,
    getUserCollection,
    moveCollectionItem
} from "../../api";

export async function get(req, res) {
    const userId = req.query.userId || req.userId;
    const items = await getUserCollection(req.userId);
    send(res, 200, items);
}

export async function post(req, res) {
    switch (req.body.action) {
        case 'create':
            await createNewCollection(req.userId);
            const col = await getUserCollection(req.userId);
            return send(res, 200, col);
        case 'move': {
            const {from, to} = req.body;
            const ok = await moveCollectionItem(req.userId, from, to);
            return send(res, 200, {ok});
        }
        case 'delete': {
            const {id} = req.body;
            console.log(req.body);
            const ok = await deleteFromUserCollection(req.userId, id);
            return send(res, 200, {ok});
        }
        case 'load-more': {
            const appended = await getMoreItems(req.userId);
            return send(res, 200, appended);
        }
        default: {
            return send(res, 400, {error: 'unknown action'});
        }
    }
}