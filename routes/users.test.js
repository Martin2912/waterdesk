var app = require("../app")
var request = require("supertest")
var uid2 = require('uid2');

describe('SignIn', () => {

    //Test signIn ==> succes
    test("signIn-succes", async (done) => {
        res = await request(app).post("/users/sign-in")
            .send({ "emailFromFront": "test@test.fr", "passwordFromFront": "test" })
            .expect(200)
            .expect({
                result: true,
                error: [{ msg: 'connexion !', type: "success" }],
                token: "Zmkx3OxAjTFCMRG4uwYhm07grUIv7rFI",
                email: "test@test.fr",
                name: "test"
            })
        done()
    })

    //Test signIn avec champs vides
    test("signIn-errorchpsVides", async (done) => {
        res = await request(app).post("/users/sign-in")
            .send({ "emailFromFront": '', "passwordFromFront": '' })
            .expect(200)
            .expect({
                result: false,
                error: [{ msg: 'Champs vides', type: 'warning' }],
                token: null,
                email: null,
                name: null
            })
        done()
    })

    //Test signIn ==> erreur mdp
    test("signIn-errorPassword", async (done) => {
        res = await request(app).post("/users/sign-in")
            .send({ "emailFromFront": "Laura@waterback.com", "passwordFromFront": "provoquerErreur" })
            .expect(200)
            .expect({
                result: false,
                error: [{ msg: 'mot de passe incorrect', type: "warning" }],
                token: null,
                email: null,
                name: null
            })
        done()
    })

})

//test des routes SignUp

describe('SignUp', () => {

    //Test signUp ==> succes

    test("post_signUp-success", async (done) => {

        var emailUnique = `martin@domain${uid2(10)}.com`; // bien que ce soit statistiquement possible qu'aléatoirement le même mail soit généré, le risque est faible
        res = await request(app).post("/users/sign-up")
            .send({ "nameFromFront": "Martin", "emailFromFront": emailUnique, "passwordFromFront": "123test123" })
            .expect(200);

        expect(await res.body.error).toStrictEqual([
            {
                msg: "Compte créé !",
                type: "success"
            }
        ])

        done()
    })

    //Test signUp ==> echec
    test("signUp-failure", async (done) => {

        res = await request(app).post("/users/sign-up")
            .send({ "nameFromFront": "Martin", "emailFromFront": "kiki@kiki.com", "passwordFromFront": "123test123" })
            .expect(200);

        expect(res.body.error).toStrictEqual([
            {
                msg: "Un compte utilise déja cet email",
                type: "warning"
            }
        ])

        done()
    })

})

//test de route Get User Alerts

describe('tests user alerts', () => {

    let userAlertToDelete

    //Test get user alerts ==> succes
    test("get-user_alerts-success", async (done) => {

        res = await request(app).post("/users/get-user_alerts")
            .send({ "emailFromFront": "Laura@waterback.com", "tokenFromFront": "bNiFMReZ0oqCmyaKK4P1MPYXovXaigmu" })
            .expect(200);

        expect(res.body.user_alerts.length).not.toStrictEqual(0)
        userAlertToDelete = res.body.user_alerts[0]  //nous supprimerons la plus ancienne alert/notification
        done()
    })

    //Test delete one user alert ==> succes
    test("delete-user_alerts-success", async (done) => {

        res = await request(app).post("/users/deleteOne-userAlert")
            .send({ "emailFromFront": "Laura@waterback.com", "tokenFromFront": "bNiFMReZ0oqCmyaKK4P1MPYXovXaigmu", "alertIdFromFront": userAlertToDelete._id })
            .expect(200);

        expect(res.body.user_alerts.length).not.toStrictEqual(0)

        done()
    })
})


//test de route Save New Marker

describe('save-new_marker', () => {

    //Test save new marker ==> success
    test("post_save-new_marker", async (done) => {

        res = await request(app).post("/users/save-new_marker")
            .send({ "userEmailFromFront": "Laura@waterback.com", "userTokenFromFront": "bNiFMReZ0oqCmyaKK4P1MPYXovXaigmu", "alertLongitudeFromFront": "0", "alertLatitudeFromFront": "0", "alertTypeFromFront": "true" })
            .expect(200);

        expect(res.body.result).toStrictEqual(true)

        done()
    })
})

//test de routes abonnements

describe('tests abo', () => {

    let aboUpdate;
    let aboDelete;

    //Test ajout nouvel abo ==> success
    test("post_new-abo", async (done) => {

        res = await request(app).post("/users/abo")
            .send({ "userEmailFromFront": "Lauren@lauren.com", "userTokenFromFront": "MCeyizoZxJh04MpE4W9uBPTYSzAF5Mdg", "aboNomFromFront": "Nouvel Abo" })
            .expect(200);

        expect(res.body.result).toStrictEqual(true)
        aboUpdate =res.body.user_abo[res.body.user_abo.length - 1]
        done()
    })

    //Test changement statut abo ==> de true à false
    test("update_new-abo", async (done) => {

        res = await request(app).put("/users/updateOne-userAbo")
            .send({ "emailFromFront": "Lauren@lauren.com", "tokenFromFront": "MCeyizoZxJh04MpE4W9uBPTYSzAF5Mdg", "aboIdFromFront": aboUpdate._id })
            .expect(200);

            expect(res.body.user_abo[res.body.user_abo.length-1].etatAbo).toBe(!aboUpdate.etatAbo)
        console.log("test update: aboupdate", aboUpdate)
        done()
    })



    //Test get user abo ==> success
    test("get-user_abo", async (done) => {

        res = await request(app).post("/users/get-user_abo")
            .send({ "emailFromFront": "Lauren@lauren.com", "tokenFromFront": "MCeyizoZxJh04MpE4W9uBPTYSzAF5Mdg" })
            .expect(200);

        expect(res.body.user_abo.length).not.toBe(0)
        aboDelete = res.body.user_abo[res.body.user_abo.length - 1]
        done()
    })

    //Test delete abo ==> success
    test("delete_one-abo", async (done) => {

        res = await request(app).post("/users/deleteOne-userAbo")
            .send({ "userEmailFromFront": "Laura@waterback.com", "userTokenFromFront": "n04hxIHoAue2r6ZlIZ13En8Zo8Vl2Pne", "aboIdFromFront": aboDelete._id })
            .expect(200);

        expect(res.body.user_abo).not.toBe(0)

        done()
    })
})

