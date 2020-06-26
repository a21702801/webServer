const express = require('express');
let router = express.Router();
const pgErrorHandler = require('./pgErrHand');

//Importar a classe Pool
const {Pool} = require('pg');

//Criar Pool para fazer conexão com a pg database
const pool = new Pool({
    user: "DiogoAzevedo",
    password: "1234",
    host: "localhost",
    port: 5432,
    database: "buddyAbroadDb",
    max: 20,
    _connectionTimeoutMillis: 0,
    idleTimeoutMillis: 10000
});
module.exports = {
    async verifyUser(token,callBack) {

        const sql = "UPDATE users.users SET verified = 't' WHERE id = (SELECT e.user_id FROM emails.emails e WHERE e.id = $1);";
        pool.query(sql, [token], (err, res) => {
            callBack(err,res)
        })
    },

    async invalidateEmail(token,callBack) {

        const sql = "UPDATE emails.emails SET valid = 'f' WHERE id = $1;";
        pool.query(sql, [token], (err, res) => {
            callBack(err,res)
        })
    },

    async findUserByEmail(email,callBack) {

        const sql = "SELECT * FROM users.users  WHERE email = $1 limit 1";
        pool.query(sql, [email], (err, res) => {

            if(err !== undefined) {
                pgErrorHandler.parseError(err);
                callBack(err,res)
            }
            if (res) {
                //Return rows
                console.table(res.rows)
                callBack(err,res.rows)
            }
        })
    },

    async registerUser(email,firstName,lastName, dateOfBirth,gender,password,callBack) {
        const sql = 'INSERT INTO users.users(email, first_name, last_name, gender, birth_date, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id';

        pool.query(sql,[email,firstName,lastName,gender,dateOfBirth,password], (err, res) => {
            callBack(err,res)
        })
    },

    async getUserByEmail(email, callBack) {
        const sql = 'SELECT * FROM users.users where email = $1 limit 1';
        pool.query(sql, [email], (err, res) => {
            console.table(res.rows);
            callBack(err,res)
        });
    },

    async changePasswordByToken(password,token,callBack) {
        const sql = "UPDATE users.users SET password = $1 WHERE id = (SELECT e.user_id FROM emails.emails e WHERE e.id = $2);"
        pool.query(sql,[password,token], (err,res) => {
            callBack(err,res)
        })
    },

    async getPassworAndVerifiedByEmail(email, callBack) {
        const sql = 'SELECT password, verified FROM users.users where email = $1 limit 1';
        pool.query(sql, [email], (err, res) => {
            console.table(res.rows);
            callBack(err,res)
        });
    },

    async getUserIdByEmail(email, callBack) {
        const sql = 'SELECT id FROM users.users WHERE email = $1;';
        pool.query(sql, [email], (err, res) => {
            callBack(err,res)
        });
    },

    async addRefreshToken(refreshToken,callBack) {
        const sql = 'INSERT INTO auth.refresh_tokens(refresh_token) VALUES ($1);';
        pool.query(sql, [refreshToken], (err, res) => {
            callBack(err,res)
        });
    },

    async getRefreshToken(refreshToken,callBack) {
        const sql = 'SELECT refresh_token FROM auth.refresh_tokens WHERE refresh_token = $1';
        pool.query(sql, [refreshToken], (err,res) => {
            callBack(err,res)
        })
    },

    async getTopVisitCards(country, quantity, callBack) {
        const sql = 'SELECT v.id, v.title, u.first_name, u.last_name, v.duration, v.min_group_size, v.max_group_size, v.price_person, v.rating, vi.img1 FROM  visits.visits v INNER JOIN  users.users u ON (v.buddy = u.id) INNER JOIN  visits.visit_images vi ON (v.id = vi.visit_id) WHERE country = $1 order by rating desc limit $2;';
        pool.query(sql, [country,quantity], (err,res) => {
            callBack(err,res)
        })
    },

    async getTwoVisitCardsByDistance(lat,lon,unit,distance,callBack) {
        const sql = 'SELECT v.id, v.title, u.first_name, u.last_name, v.duration, v.min_group_size, v.max_group_size, v.price_person, v.rating, vi.img1 FROM  visits.visits v INNER JOIN  users.users u ON (v.buddy = u.id) INNER JOIN  visits.visit_images vi ON (v.id = vi.visit_id) WHERE geolocation_distance($1,$2,v.latitude,v.longitude,$3) < $4limit 2;';
        pool.query(sql, [lat,lon,unit,distance], (err,res) => {
            callBack(err,res)
        })
    },

    async getFiveSearchCards(id,
                             country,
                             pricePersonLower,
                             pricePersonUpper,
                             ratingLower,
                             ratingUpper,
                             maxDuration,
                             groupSizeLower,
                             groupSizeUpper,
                             radius,
                             latitude,
                             longitude,
                             unit,
                             callBack) {

        const sql = 'SELECT v.id, v.title, u.first_name, u.last_name, v.duration, v.min_group_size, v.max_group_size, v.price_person, v.rating, vi.img1 FROM  visits.visits v INNER JOIN  users.users u ON (v.buddy = u.id) INNER JOIN  visits.visit_images vi ON (v.id = vi.visit_id) WHERE v.id > $1 AND country = $2 AND price_person >= $3 AND price_person <= $4 AND rating >= $5 AND rating <= $6 AND duration <= $7 AND min_group_size >= $8 AND max_group_size <= $9 AND geolocation_distance($11,$12,v.latitude,v.longitude,$13) <= $10 limit 5;';
        pool.query(sql, [id,country,pricePersonLower.toString(),pricePersonUpper.toString(),ratingLower,ratingUpper,maxDuration,groupSizeLower,groupSizeUpper,radius,latitude,longitude,unit], (err,res) => {
            callBack(err,res)
        })
    },

    async addFakeVisit(title,duration,mings,maxgs,description,pricePerson,rating,lat,lon,country,buddy,callBack) {
        const sql = 'INSERT INTO visits.visits(title, duration, min_group_size, max_group_size, description, price_person, rating, latitude, longitude, country, buddy)VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);'
        pool.query(sql, [title,duration,mings,maxgs,description,pricePerson,rating,lat,lon,country,buddy], (err,res) => {
            callBack(err,res)
        })
    },

    async addEmail(emailId, userId,expiresAt, emailType, callBack) {
        const sql = 'INSERT INTO emails.emails(id, user_id, expires_at, type) VALUES ($1, $2, $3, $4);';
        pool.query(sql, [emailId, userId, expiresAt, emailType], (err, res) => {
            callBack(err,res)
        });
    },

    async getEmailById(emailId, callBack) {
        const sql = 'SELECT * FROM emails.emails WHERE id = $1;';
        pool.query(sql, [emailId], (err, res) => {
            callBack(err,res)
        });
    },
}
