require('dotenv').config();
import url from 'url';
import axios from 'axios';

const Redis = require('ioredis');

// region rijksmuseum
const PAGE_LIMIT = 10;
const LIMIT = 100;

const baseParams = {
    key: process.env.KEY,
    ps: '10',
    imgonly: 'True',
    p: '1',
}


/**
 * Получить арт объекты
 * @param page
 * @param limit
 * @returns {Promise<*>}
 */
export async function fetchData(page, limit = 100) {
    console.log(`fetching data: page:${page}, limit:${limit}`);
    const params = new url.URLSearchParams({...baseParams, p: `${page}`, ps: `${limit}`});
    const baseUrl = 'https://www.rijksmuseum.nl/api/en/collection'
    const test = `${baseUrl}?${params}`
    const response = await axios.get(test)
    return response.data.artObjects;
}

//endregion

//region redis
export const redis = new Redis(process.env.REDIS_URL);

/**
 * Элемент коллекции по ключу
 * @param id {string} - ключ
 * @returns {*}
 */
const getItemById = id => redis.hgetall(`item:${id}`);

/**
 * Случайные ключи элементов
 * @param count {number} - количество
 * @returns {Promise<*>}
 */
const getRandomItemsIds = async (count = 12) => redis.srandmember('items', count);

/**
 * Создать новую коллекцию
 * @param id {string}
 * @param count {number}
 * @returns {Promise<void>}
 */
export const createNewCollection = async (id, count = 12) => {
    const k = `user:${id}`;
    const ids = await getRandomItemsIds(count);
    await redis.del(k);
    await redis.rpush(k, ids);
}

/**
 * Удалить элемент из пользовательской коллекции
 * @param userId
 * @param id
 * @returns {Promise<void>}
 */
export const deleteFromUserCollection = async (userId, id) => {
    const k = `user:${userId}`;
    const res = await redis.lrem(k, 0, id);
    return res > 0;
}

export const getMoreItems = async (userId) => {
    const k = `user:${userId}`;
    const  ids = [];
    while (ids.length < 3) {
        const [id] = await getRandomItemsIds(1);
        const idx = await redis.lpos(k, id);
        console.log(id, idx);

        if (idx === null) {
            ids.push(id)
        }
    }
    await redis.rpush(k, ids);
    return Promise.all(ids.reverse().map(getItemById));
}

export const moveCollectionItem = async (userId, from, to) => {
    const k = `user:${userId}`;
    const ids = await redis.lrange(k, 0, -1); //TODO
    const tmp = ids.splice(from, 1);
    ids.splice(to, 0, tmp[0]);
    await redis.del(k);
    await redis.rpush(k, ids);
    return true;
}

/**
 * Инициализировать коллекцию нового пользователя
 * @param id
 * @returns {Promise<void>}
 */
export const initUserCollection = async id => {
    const k = `user:${id}`;
    const randItems = await getRandomItemsIds(12);
    await redis.rpush(k, randItems);
}

export const getItemsTotalCount = _ => redis.scard('items');

/**
 * Получить коллекцию пользователя
 * @param id {string} id пользователя
 * @returns {Promise<unknown[]>}
 */
export const getUserCollection = async (id) => {
    const k = `user:${id}`;
    const ids = await redis.lrange(k, 0, -1);
    return Promise.all(ids.map(getItemById));
}
//endregion


/**
 * Кэширует данные из API в редиске
 * @returns {Promise<void>}
 */
export const preload = async () => {
    const lastPage = await redis.hget('api', 'page') || 0;
    let page = +lastPage + 1;
    while (page <= PAGE_LIMIT) {
        console.log(`fetching page ${page} of ${PAGE_LIMIT}`);
        try {
            const newData = await fetchData(page, LIMIT);
            for (const x of newData) {
                const tmp = {
                    id: x.id,
                    link: x.links.web,
                    img: x.webImage.url.replace('=s0', '=s300'),
                    width: x.webImage.width,
                    height: x.webImage.height,
                    title: x.title,
                    longTitle: x.longTitle,
                };
                await redis.hmset(`item:${tmp.id}`, tmp);
            }
            await redis.hset('api', 'page', page);
            await redis.sadd('items', newData.map(x => x.id));
            page++;

        } catch (e) {
            console.error(e.message);
        }
    }
}