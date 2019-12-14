const mongoose = require("mongoose");
let mode = "";
if (process.env.NODE_ENV === "testing") {
    mode = "-test";
}
mongoose.connect(process.env.MONGO_DB, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}, function (err) {
    if (err) console.log(`Failed to connect database.`, err);
    else console.log(`Success to connect database.`);
});

module.exports = mongoose;