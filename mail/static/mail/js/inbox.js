document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archive').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#flags').addEventListener('click', () => load_mailbox('flags'));
  document.querySelector('#spam').addEventListener('click', () => load_mailbox('spam'));
  document.querySelector('#trash').addEventListener('click', () => load_mailbox('trash'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

// Loads the compose view function
function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';


  // Remove the active colors from the all nav buttons
  const activeElements = document.querySelectorAll(".nav-item");

  activeElements.forEach(activeElement => {

    activeElement.classList.remove("active");

  });

  // Add the active color to the compose button when the compose view is loading
  const composeBtn = document.getElementById("compose");
  composeBtn.classList.add("active");

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // fetch and send the email using POST method and send the newly entered values to the fields
  document.querySelector('#compose-form').onsubmit = () => {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    })
      .then(response => response.json())
      .then(() => {
        load_mailbox('sent');
      });
    return false;
  };
}


// Loads the emails list view function
function load_mailbox(mailbox) {

  // Remove the active selected color from the all nav buttons
  const activeElements = document.querySelectorAll(".nav-item");

  activeElements.forEach(activeElement => {

    activeElement.classList.remove("active");

  });

  // Adds the active color the selected view (mailbox)
  const navButton = document.getElementById(`${mailbox}`);
  navButton.classList.add("active");

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<div class="mailbox-title">${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</div>`;
  var hr = document.createElement('hr');
  document.querySelector("#emails-view").appendChild(hr);


  // Request and display emails from the selected mailbox
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      console.log(emails.length)

      // Disply emails if the email list is not empty.
      if (emails.length > 0) {
        emails.forEach(email => {
          const singleMail = document.createElement("div");
          singleMail.innerHTML =
            `
              <div class="email-list">
              <i class='bx bx-square-rounded' style="color: grey; margin: 0.25em 1em;"></i>
              <span style="width: 240px;">${email.sender}</span>
              <span style="width: 400px;">${email.subject}</span> 
              <span style="position: absolute; right: 100px;">${email.timestamp}</span>
              <i class="fa-regular fa-bookmark small-flag-btn" style="font-size: 18px; color: grey; position: absolute; right: 57px; margin: 0.15em 0;"></i>
              </div>
              `

          singleMail.className = "mailbox-email"

          // Displays the selected email when the email is clicked.
          singleMail.addEventListener('click', function () {

            fetch(`/emails/${email.id}`)
              .then(response => response.json())
              .then(email => {

                // If the email haven't read yet, set the read is True when clicking the specific email. 
                if (!(email.read)) {
                  fetch(`/emails/${email.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ read: true })
                  })
                    .then(response => { console.log(`PUT status for updating read state returned status code ${response.status}`) })
                }

                // Loads the email view function
                loadEmail(email, mailbox)
              });
          })

          // Changes the font weight if the email is not read yet
          if (!(email.read)) {
            singleMail.style.fontWeight = '500';
          }


          // If email haven't read yet, Change the backround color of the emails in the email list
          singleMail.style.backgroundColor = "white";
          if (email.read) {
            singleMail.style.backgroundColor = "rgba(242,245,245,0.8)";
          }

          // Adds the email to the enail list.
          document.querySelector("#emails-view").append(singleMail)

        })

        // Change the bookmark status if the email is flaged by user.
        var count = 0;

        emails.forEach(email => {

          const smallflagButton = document.getElementsByClassName("small-flag-btn")[count];

          // Check the email flag status
          if (email.flaged) {
            smallflagButton.classList.remove("fa-regular");
            smallflagButton.classList.add("fa-solid");
            smallflagButton.style.color = "#ff2e4d";
          }

          // Increase the count (Used to select the specific flaged emails)
          count++;

        })

      }

      // Display the default background if there's no emails in the mailbox
      else {
        const emptyMail = document.createElement("div");
        emptyMail.innerHTML = `
        <img src="https://us.123rf.com/450wm/tpimovit/tpimovit1711/tpimovit171100350/90266895-vector-paper-airplane-travel-route-symbol-vector-illustration-of-hand-drawn-paper-plane-isolated-out.jpg?ver=6" style="height:350px; width: auto; opacity: 50%;">
        <br>
        <span>You dont have any ${mailbox} yet!</span>
        `
        emptyMail.classList.add("empty-page")

        // Add the default page to the email list view.
        document.querySelector("#emails-view").append(emptyMail)
      }

    });
}

// Diplay the specific email view function.
function loadEmail(email, mailbox) {

  // Show the specific email and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  // Create th email toobar with some useful tools
  const emailToolBar = document.createElement("div");
  emailToolBar.className = 'email-toolbar';
  emailToolBar.innerHTML =
    `
  <i class='bx bx-arrow-from-right toolbar-icons' id="back-button"></i>
  <i class='toolbar-icons' id='archive-btn'></i>
  <i class='toolbar-icons' id='spam-btn' style="font-size: 23px; margin-right: 0.8em; transform: translate(0px,-3px);"></i>
  <i class='toolbar-icons' id='delete-btn'></i>
  <i class='toolbar-icons' id='flag-btn' style="font-size: 19px; margin-right: 1em;"></i>
  <i class='fa-solid fa-reply toolbar-icons ReplyBtns' id="reply-btn" style="font-size: 19px;"></i>
  <i class='bx bx-dots-vertical-rounded toolbar-icons'></i>
  `;

  // Display the subject of the email
  const subjectTitle = document.createElement("h3");
  subjectTitle.innerHTML = email.subject;
  subjectTitle.className = 'subject-title';

  // Display the sender, recipients and timestamp of the email
  const detailedInfo = document.createElement("div");
  detailedInfo.style.fontSize = '14px'
  detailedInfo.style.marginBottom = '1em'
  detailedInfo.innerHTML =
    `
      <div>
          <span class="text-muted">From: </span>${email.sender}
          <span class="text-muted" style="float: right; font-size: 13px">${email.timestamp}
          </span>
      </div>
      <div>
          <span class="text-muted">To: </span>${email.recipients.join()}
      </div>
  `
  // Dsplay the body of the email
  const bodySection = document.createElement("div");
  bodySection.innerText = email.body;
  bodySection.style.marginTop = '2em';

  // Diaply the reply and forward buttons
  const replyNshareButtons = document.createElement("div");
  replyNshareButtons.innerHTML =
    `
  <button class='main-reply-btn' id='mainForwardBtn'>FORWARD&nbsp;&nbsp;<i class='fa-solid fa-share'></i></button>
  <button class='main-reply-btn ReplyBtns' id='mainReplyBtn'><i class='fa-solid fa-reply'></i>&nbsp;&nbsp;REPLY</button>

  `
  replyNshareButtons.classList.add("replyNshareBtns");

  // Add the above elements to the page
  document.querySelector('#email-view').innerHTML = "";
  document.querySelector('#email-view').append(emailToolBar)
  document.querySelector('#email-view').append(subjectTitle)
  document.querySelector('#email-view').append(detailedInfo)
  document.querySelector('#email-view').append(bodySection)
  document.querySelector('#email-view').append(replyNshareButtons)

  // Navigator for the previos mailbox
  document.querySelector('#back-button').addEventListener('click', function (event) {
    load_mailbox(mailbox)
  });

  // Reply to the email when reply buttons clicked.(Both buttons in tolbara and bottom of the email)
  const mainReplyBtns = document.querySelectorAll('.ReplyBtns');

  mainReplyBtns.forEach(rplyBtn => rplyBtn.addEventListener('click', function (event) {
    compose_email(); 

    // Prefill the email with the available content
    document.querySelector('#compose-recipients').value = email.sender;
    document.querySelector('#compose-subject').value = email.subject.slice(0, 4) == 'Re: ' ? 'Re: ' + email.subject.slice(4,) : 'Re: ' + email.subject;
    document.querySelector('#compose-body').value = `On ${email.timestamp} <${email.sender}> wrote:\n\n${email.body}
    \n-----------------------------------------------------------------------------------------------------------------\n\n`;
  }));

  // Forward the email to another person when the forward button in the bottom of the email is clicked
  document.querySelector('#mainForwardBtn').addEventListener('click', function (event) {
    compose_email();

    // Prefill the email with the available content
    document.querySelector('#compose-recipients').value = "";
    document.querySelector('#compose-subject').value = email.subject.slice(0, 4) == 'Forward: ' ? 'Forward: ' + email.subject.slice(4,) : 'Forward: ' + email.subject;
    document.querySelector('#compose-body').value = `On ${email.timestamp} <${email.sender}> wrote:\n\n${email.body}`;
  });

  // Change the archive button if the email is already archived 
  if (!(mailbox === "archive")) {
    const archiveButton = document.getElementById("archive-btn");
    archiveButton.classList.add("bx");
    archiveButton.classList.add("bxs-archive-in");

    // Archive the email when icon is clicked if the email is not archived yet
    archiveButton.addEventListener('click', function () {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({ archived: true })
      })
        .then(response => {
          console.log(`PUT status for updating archive state returned status code ${response.status}`)
          load_mailbox("inbox")
        })
    })

    // Change the archive button if the email is not archived yet.
  } else if (mailbox === "archive") {
    const unarchiveButton = document.getElementById("archive-btn");
    unarchiveButton.classList.add("bx");
    unarchiveButton.classList.add("bxs-archive-out");

    // Unachive the email when the icon is clicked if the email is archived
    unarchiveButton.addEventListener('click', function () {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({ archived: false })
      })
        .then(response => {
          console.log(`PUT status for updating archive state returned status code ${response.status}`)
          load_mailbox("inbox")
        })
    })
  }

  // Change the trash button if the email is not moved to the trash yet.
  if (!(mailbox === "trash")) {
    const deleteButton = document.getElementById("delete-btn");
    deleteButton.classList.add("bx");
    deleteButton.classList.add("bxs-trash-alt");

    // Move the email to the trash when the icon is clicked if the email haven't moved yet
    deleteButton.addEventListener('click', function () {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({ deleted: true })
      })
        .then(response => {
          console.log(`PUT status for updating delete state returned status code ${response.status}`)
          load_mailbox(`${mailbox}`)
        })
    })

  // Change the trash button if the email is already moved to the trash.
  } else if (mailbox === "trash") {

    // Hide unwanted toolbar icons from the toolbar
    const unarchiveButton = document.getElementById("archive-btn");
    unarchiveButton.style.display = 'none';

    const flagButton = document.getElementById("flag-btn");
    flagButton.style.display = 'none';

    const spamButton = document.getElementById("spam-btn");
    spamButton.style.display = 'none';

    const replyIcon = document.getElementById("reply-btn");
    replyIcon.style.display = 'none';

    // Hides the reply and forward buttons in the vottom of the email.
    replyNshareButtons.style.display = 'none';

    const deleteButton = document.getElementById("delete-btn");
    deleteButton.classList.add("fa-solid");
    deleteButton.classList.add("fa-trash-arrow-up");

    // Move the email to the inbox when the icon is clicked if the email is moved to trash.
    deleteButton.addEventListener('click', function () {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({ deleted: false })
      })
        .then(response => {
          console.log(`PUT status for updating delete state returned status code ${response.status}`)
          load_mailbox("trash")
        })
    })
  }

  // Change the spam button if the email haven't marked as a spam yet.
  if (!(mailbox === "spam")) {
    const spamButton = document.getElementById("spam-btn");
    spamButton.classList.add("bx");
    spamButton.classList.add("bxs-shield-x");

    // Move the email to the spam when the icon is clicked if the email haven't moved to spam yet.
    spamButton.addEventListener('click', function () {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({ spam: true })
      })
        .then(response => {
          console.log(`PUT status for updating spam state returned status code ${response.status}`)
          load_mailbox(`${mailbox}`)
        })
    })

  // Change the spam button if the email is already marked as a spam.
  } else if (mailbox === "spam") {

    const spamButton = document.getElementById("spam-btn");
    spamButton.classList.add("bx");
    spamButton.classList.add("bxs-check-shield");

    // Hide unwanted toolbar icons from the toolbar
    const flagButton = document.getElementById("flag-btn");
    flagButton.style.display = 'none';

    const unarchiveButton = document.getElementById("archive-btn");
    unarchiveButton.style.display = 'none';

    const replyIcon = document.getElementById("reply-btn");
    replyIcon.style.display = 'none';

    // Hides the reply and forward buttons in the vottom of the email.
    replyNshareButtons.style.display = 'none';

    // Move the email to the inbox when the icon is clicked if the email is already moved to spam.
    spamButton.addEventListener('click', function () {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({ spam: false })
      })
        .then(response => {
          console.log(`PUT status for updating spam state returned status code ${response.status}`)
          load_mailbox("spam")
        })
    })
  }

  if (mailbox === "sent") {

    // Hide unwanted toolbar icons from the toolbar
    const spamButton = document.getElementById("spam-btn");
    spamButton.style.display = 'none';

    const archiveButton = document.getElementById("archive-btn");
    archiveButton.style.display = 'none';
  }

  const flagButton = document.getElementById("flag-btn");

  if (email.flaged) {
    flagButton.classList.add("fa-solid");
    flagButton.classList.add("fa-bookmark");
    flagButton.style.color = "#ff2e4d";
    flagButton.addEventListener('click', function () {
      flagButton.classList.remove("fa-solid");
      flagButton.classList.add("fa-regular");
      flagButton.style.color = "grey";
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({ flaged: false })
      })
        .then(response => {
          console.log(`PUT status for updating flag state returned status code ${response.status}`)
        })
    })
  }

  else {
    flagButton.classList.add("fa-regular");
    flagButton.classList.add("fa-bookmark");
    flagButton.addEventListener('click', function () {
      flagButton.classList.remove("fa-regular");
      flagButton.classList.add("fa-solid");
      flagButton.style.color = "#ff2e4d";
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({ flaged: true })
      })
        .then(response => {
          console.log(`PUT status for updating flag state returned status code ${response.status}`)
        })
    })
  }
}