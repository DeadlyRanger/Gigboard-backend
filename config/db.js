import mongoose from 'mongoose';


const dbConnect = async()=>{
 try{
      await mongoose.connect(process.env.MONGO_URL)
      .then(()=>console.log('db is connected successfully'))
      .catch((err)=> console.error(err));
 }
 catch(err){
    console.log(err)
 }
}

export default dbConnect;