import styles from '@/styles/SignUp.module.css'
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router'
import { useState } from 'react';


const SignupTwo = ({secondSubmit}) => {
    const [userType, setUserType]=useState();

    const handleSubmit=(e)=>{
        e.preventDefault();
        secondSubmit(userType);
        
    }

  return (
    <div className={styles.questionOneStyle}>
        <Head>
            <title>Get started | FarmConnectET</title>
        </Head>    
        <div>
        <Image className={styles.imgStyle} src="/logo.jpg" height={65} width={230}></Image>
        <h1 className={styles.headerTextStyle}>Customize Your Preferences</h1>
        
        <div className={styles.formDivStyle}>
            <form className={styles.formStyle}>

            <label className={styles.labelStyle}> Are you here to buy or sell products?</label>
            <select className={styles.optionStyle} value={userType}
            onChange={(e)=>setUserType(e.target.value)}>
                <option hidden>Select the one that applies to you</option>
                <option value="Consumer">To buy products</option>
                <option value="Farmer">To sell products</option>
                <option value="Material">To sell agriculture material</option>
                <option value="Both">Both</option>
            </select>
            <button className={styles.loginButton}
            onClick={handleSubmit}>Next</button>
            </form>

        </div>
        </div>
    </div>

  )
}

export default SignupTwo