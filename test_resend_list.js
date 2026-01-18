import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

console.log('Keys of resend.emails:', Object.keys(resend.emails));
console.log('Type of resend.emails.list:', typeof resend.emails.list);

async function testList() {
    if (typeof resend.emails.list !== 'function') {
        console.log('resend.emails.list is NOT a function');
        return;
    }
    try {
        const response = await resend.emails.list();
        console.log('Resend List Response:', JSON.stringify(response, null, 2));
    } catch (error) {
        console.error('Error listing emails:', error);
    }
}

testList();
