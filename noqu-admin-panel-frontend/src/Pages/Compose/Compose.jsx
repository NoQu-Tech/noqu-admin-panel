import React, { useState } from 'react';
import axios from '../../utils/axiosInstance';
import "./Compose.css"
import sendToMailID from "./../../../src/assets/sendToMailID.jpg"
import sendToSub from "./../../../src/assets/sendToSub.jpg"
import backarrow from "./../../../src/assets/backarrow.png"
import done2 from "./../../../src/assets/done2.png"
import fail2 from "./../../../src/assets/fail2.png"


const Compose = () => {
  const [subject, setSubject] = useState('');
  const [subjectForSub, setSubjectForSub] = useState('');
  const [email, setemail] = useState('');
  const [htmlBody, setHtmlBody] = useState(''); // Rich HTML content from TinyMCE
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [mailto, setMailto] = useState("options")
  const [submitResult, setSubmitResult] = useState("from")

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "text/html") {
      const reader = new FileReader();
      reader.onload = (event) => {
        setHtmlBody(event.target.result);
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a valid HTML file.");
    }
  };

  const handleFileChange2 = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "text/html") {
      const reader = new FileReader();
      reader.onload = (event) => {
        setHtmlBody(event.target.result);
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a valid HTML file.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setStatusMessage('');

    try {
      // const response = await axios.post('http://localhost:3003/db/send-newsletter', {

      const response = await axios.post('https://noqu.in/db/send-newsletter', {
        subject: subject,
        htmlBody: htmlBody, // Send the rich HTML content
      }); 
      setSubmitResult("Result")
      setStatusMessage(response.data.message);
      // alert(response.data.message)
    } catch (error) {
      setStatusMessage('Failed to send the newsletter.');
      setSubmitResult("Result")
      // alert(statusMessage)
    } finally {
      setIsSending(false);
      setSubject('')
      // alert(statusMessage)
    }
  };

  const handlePrvPage = () => {
    if (mailto === "tosub" || mailto === "toemail") {
      setMailto("options")
      setSubmitResult("form")
    }
  }
  const handleSubmit2 = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setStatusMessage('');

    try {
      // const response = await axios.post('http://localhost:3003/db/send-newsletter-bymail', {

      const response = await axios.post('https://noqu.in/db/send-newsletter-bymail', {
        email: email,
        subject: subjectForSub,
        htmlBody: htmlBody, // Send the rich HTML content
      });
      setSubmitResult("Result")
      setStatusMessage(response.data.message);
      
      // alert(response.data.message)
    } catch (error) {
      setStatusMessage('Failed to send the newsletter.');
      // alert(statusMessage)
      setSubmitResult("Result")
    } finally {
      setIsSending(false);
      setemail('')
      setSubjectForSub('')
      // alert(statusMessage)
    }
  };

  return (
    <div className='NL_compose'>
      <div className="NL_compose_head">
        <h2 className='TAM_h1'><span onClick={handlePrvPage} style={{ display: mailto === "options" ? "none" : "block" }}><img src={backarrow} width={25} /></span> Compose Newsletter</h2>
      </div>


      {mailto === "options" &&
        <div className="compose_option">
          <div className="compose_option-box">
            <div className="compose_options" onClick={() => setMailto("tosub")}>
              <img src={sendToSub} />
              <h5>To Subscribers</h5>
            </div>
            <div className="compose_options" onClick={() => setMailto("toemail")}>
              <img src={sendToMailID} />
              <h5>To Email</h5>
            </div>
          </div>
        </div>}



      {mailto === "tosub" && <div className="compose_form1">
        {submitResult === "Result" ?
          <>
            <div className="submitresult">
              <img src={statusMessage === 'Failed to send the newsletter.' ? fail2 : done2} width={100} />
              <h5>{statusMessage}</h5>
              <button onClick={() => setSubmitResult("from")}>Back</button>
            </div>
          </> : <>
            <form onSubmit={handleSubmit}>
              <h5>Send newsletter to subscribers</h5>
              <div className='NL_compose_row'>
                <label>Subject:</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>
              <div className='NL_compose_row'>
                <label>Upload HTML File:</label>
                <input
                  type="file"
                  accept=".html"
                  onChange={handleFileChange}
                  required
                />
              </div>
              <div className="NL_submit_button">
                <button type="submit" disabled={isSending}>
                  {isSending ? 'Sending...' : 'Send Newsletter'}
                </button>
              </div>
            </form>
          </>}
        {/* {statusMessage && <p>{statusMessage}</p>} */}
      </div>}





      {mailto === "toemail" && <div className="compose_form1">
        {submitResult === "Result" ?
          <>
            <div className="submitresult">
              <img src={statusMessage === 'Failed to send the newsletter.' ? fail2 : done2} width={100} />
              <h5>{statusMessage}</h5>
              <button onClick={() => setSubmitResult("from")}>Back</button>
            </div>
          </> : <>
            <form onSubmit={handleSubmit2}>
              <h5>Send newsletter to Mail</h5>
              <div className='NL_compose_row'>
                <label>Email:</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setemail(e.target.value)}
                  required
                />
              </div>
              <div className='NL_compose_row'>
                <label>Subject:</label>
                <input
                  type="text"
                  value={subjectForSub}
                  onChange={(e) => setSubjectForSub(e.target.value)}
                  required
                />
              </div>
              <div className='NL_compose_row'>
                <label>Upload HTML File:</label>
                <input
                  type="file"
                  accept=".html"
                  onChange={handleFileChange2}
                  required
                />
              </div>
              <div className="NL_submit_button">
                <button type="submit" disabled={isSending}>
                  {isSending ? 'Sending...' : 'Send Newsletter'}
                </button>
              </div>
            </form>
          </>}
        {/* {statusMessage && <p>{statusMessage}</p>} */}
      </div>}
    </div>
  );
};

export default Compose;
