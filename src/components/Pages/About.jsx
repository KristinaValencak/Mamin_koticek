import { Box } from '@chakra-ui/react'
import React from 'react'
import Hero from '../ABOUT/Hero'
import Section1 from '../ABOUT/Section1'
import Ponudba from '../ABOUT/Ponudba'
import KajLahkoObjavim from '../ABOUT/KajLahkoObjavim'
import MojaZgodba from '../ABOUT/MojaZgodba'
import Varnost from '../ABOUT/Varnost'
import Donacija from '../ABOUT/Donacija'
import Footer from '../Footer/Footer'
import Kontakt from '../Kontakt/Kontakt'

const About = () => {

  return (
    <Box minH="100dvh">
      <Hero />
      <Section1 />
      <Ponudba />
      <KajLahkoObjavim />
      <MojaZgodba />
      <Varnost />
      <Donacija />
      <Kontakt />
      <Footer />
    </Box>
  )
}

export default About
