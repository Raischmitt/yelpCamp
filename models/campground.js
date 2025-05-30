const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const CampGroundSchema = new Schema({
    
    image: [
         {
        url: String,
        filename: String,
         }
    ],

    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
},
reviews: [
    {
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }
]

    
});


CampGroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('CampGround', CampGroundSchema);






