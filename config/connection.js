const mongoose = require("mongoose");
let database = process.env.MONGO_DB;
/* istanbul ignore next */
if (process.env.NODE_ENV === "testing") {
    database = process.env.MONGO_DB_TEST;
}
mongoose.connect(database, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}, function(err){
    /* istanbul ignore next */
    if (err)    console.log(`Failed to connect database.`);
    else        console.log(`Success to connect database.`);
});

module.exports = mongoose;