import React from 'react'
import {Box,Stack} from "@chakra-ui/react"
import Card from './Card'
import axios from "axios"

const Home = () => {

  const checkouthandler =async(amount)=>{
    const {data:{key}}=await axios.get("http://localhost:8000/api/getkey")
    const {data:{order}}=await axios.post("http://localhost:8000/checkout",{amount})
    console.log(window);
    const options ={
      key,
      amount:order.amount,
      currency:"INR",
      name:"Ayan",
      description:"Razorpay tutorial",
      image:"https://avatars.githubusercontent.com/u/110853455?v=4&size=64",
      order_id:order.id,
      callback_url:"http://localhost:8000/paymentverification",
      prefill:{
        name:"Ayan",
        email:"ayanqurashi10@gmail.com",
        contact:"1234567890"
      },
      notes:{
        "address":"razorapy official"
      },
      theme:{
        "color":"#e91818"
      }
    };
    const razor = new window.Razorpay(options);
    razor.open();

  }

  return (
    <Box>
    <Stack h={"100vh"} justifyContent={"center"} alignItems={"center"} direction={["column","row"]}>
     <Card amount={7} img={"https://resize.indiatvnews.com/en/resize/newbucket/400_-/2019/11/whatsapp-image-2019-11-24-at-16-1574593427.jpeg"} checkouthandler={checkouthandler}  />
    </Stack>
  </Box>
  )
}

export default Home