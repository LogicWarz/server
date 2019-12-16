const mongoose = require("mongoose");
let mode = "";
/* istanbul ignore next */
if (process.env.NODE_ENV === "testing") {
    mode = "-test";
}
mongoose.connect(process.env.MONGO_DB + mode, {
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