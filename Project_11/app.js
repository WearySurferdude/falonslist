const BASE_URL = "https://strangers-things.herokuapp.com/api/2004-UNF-HY-WEB-PT"
const LOGIN_URL = "https://strangers-things.herokuapp.com/api/2004-UNF-HY-WEB-PT/users/login";
const REGISTER_URL = "https://strangers-things.herokuapp.com/api/2004-UNF-HY-WEB-PT/users/register";
const POST_DOCS = "https://strangers-things.herokuapp.com/api/2004-UNF-HY-WEB-PT/posts";
let USERNAME = localStorage.getItem("username");
let PASSWORD;
let LOGIN = false;
let TOKEN = localStorage.getItem("token");
const ROOT = $('#postsdiv');
const APP = $('#renderposts');
const MSG = $('.messagesdiv');
const MSGDIV = $('#messages');
let STATE = {
    POSTIES: [],
    MESSAGES: [],
};


//REGISTER NEW USER FUNCTIONS & CLICK HANDLERS
//REGISTER NEW USER CLICK FUNCTION
$('#registerbutton').on('click', function () {
    event.preventDefault();
    $('.modal').addClass('open');
});
//SUBMIT NEW USER CLICK FUNCTION
$('.submituser').on('click', function () {
    event.preventDefault();
    $('.modal').removeClass('open');
    $('#logoutbutton').addClass('open');
    register();
})
//CANCEL BUTTON ON MODAL TO CANCEL NEW USER
$('.canceluser').on('click', function () {
    $('.modal').removeClass('open')
})
//REGISTER USER FUNCTION
async function register() {
    try {
        const response = await fetch(`${REGISTER_URL}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify({
                user: {
                    username: $('#newusername').val(),
                    password: $('#newpassword').val(),
                }
            }),
        })
        const data = await response.json();
        console.log('register user', data);
    } catch (error) {
        console.error(error);
    }
}
//LOGIN FUNCTION
async function login() {
    try {
        const response = await fetch(`${LOGIN_URL}`, {

            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user: {
                    username: $('#uname').val(),
                    password: $('#psw').val()
                }
            }),
        })
        const json = await response.json();
        console.log('login response:', json);
        const newToken = json.data.token;
        localStorage.setItem('token', newToken);
    } catch (error) {
        console.error(error, 'failed to log in');
    }
}
//CHECK LOGIN FUNCTION
function checkLogin() {
    if (TOKEN) {
        return LOGIN = true;
    } else {
        return LOGIN = false;
    }
}
//FETCH USER FUNCTIONS
async function fetchUser() {
    try {
        const response = await fetch(`${BASE_URL}/users/me`, {
            method: "GET",
            headers: {
                "content-type": "application/json",
                "authorization": `Bearer ${TOKEN}`
            }
        })
        const data = await response.json();
        localStorage.setItem('username', data.username);
        STATE.MESSAGES = data.messages;
        console.log(data.messages);
        return data.messages;

    } catch (error) {
        console.error(error);
    }
}
//LOGIN / LOGOUT FUNCTIONS & CLICK HANDLERS
//LOGIN BUTTON
$('#loginbutton').on('click', function () {
    event.preventDefault();
    login();
    checkLogin();
    toggleButtons();
})
//USER BUTTONS
function toggleButtons() {
    if (LOGIN === true) {
        $('.logout').addClass('open');
        $('.messages').addClass('open');
    } else {
        $('.logout').removeClass('open');
        $('.messages').removeClass('open');
    }
}
//LOGOUT BUTTON
$('.logout').on('click', function () {
    localStorage.removeItem('token');
    $('.logout').removeClass('open');
    $('.messages').removeClass('open');
})
//END OF USER LOGIN/REGISTER FUNCTIONS

//RENDER & FETCH MAIN POST FUNCTIONS
//FETCH POSTS FUNCTION
async function fetchPosts() {
    try {
        const response = await fetch(`${POST_DOCS}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${TOKEN}`
            },
        })
        const { data } = await response.json();
        STATE.POSTIES = data.posts
        renderHelper();
        return data;
    } catch (error) {
        console.error('Unable to receive posts!', error)
    }
}
fetchPosts();
//RENDER HELPER FUNCTION
function renderHelper() {
    ROOT.append(APP)
    APP.empty()
    APP.prepend(updateMainPosts(STATE.POSTIES))
}
//UPDATE MAIN POSTS HELPER FUNCTION
function updateMainPosts(POSTIES) {
    return POSTIES.map(function (post) {
        return renderPost(post)
    });
}
//RENDER POST FUNCTION
function renderPost(post) {
    const { title, author, isAuthor, location, description, price, willDeliver } = post;
    return $(`<main class='posts'> <span id="titles">Title: ${title}</span><br>
     <span id="authors"> Author: ${author.username}</span> 
     <p id="descriptions"> Decsription: ${description}</p>
      <span id="prices"> Price: ${price}</span> <br>
      <span id="locations"> Location: ${location}</span> <br>
      <span id="deliveries"> Delivery : ${willDeliver ? "yes" : "no"}</span><br> 
      ${isAuthor ? '' : '<button class="messageuser">c o n t a c t</button>'}
      ${isAuthor ? '<button class="deletepost">d e l e t e</button>' : ''}
      </main>`).data('POST_ID', post._id);
}
//END OF RENDER AND FETCH POSTS FUNCTIONS

//CREATE NEW POST FUNCTIONS & CLICK HANDLERS
//CREATE NEW POST FUNCTION
async function createPost(newPost) {
    checkLogin();
    try {
        const response = await fetch(`${POST_DOCS}`, {
            method: "POST",
            body: JSON.stringify(newPost),
            headers: {
                "Content-type": "application/json",
                "Authorization": `Bearer ${TOKEN}`
            },
        })
        const data = await response.json();
        console.log("create response:", data);
    } catch (error) {
        console.error(error);
    }
}
//CREATE NEW POST CLICK FUNCTION
$('#submitbutton').on("click", function () {
    event.preventDefault();
    const newPost = {
        post: {
            author: USERNAME,
            title: $('#title').val(),
            description: $('#description').val(),
            location: $('#location').val(),
            price: $('#price').val(),
            willDeliver: $("input[name|= 'delivery']").val(),
        }
    }
    createPost(newPost);
    bootstrap();
})
//DELETE USER POST FUNCTIONS & CLICK HANDLERS
//DELETE POST CLICK FUNCTION
$(document).on("click", ".deletepost", function () {
    event.preventDefault();
    const POST_ID = $(this).closest(".posts").data('POST_ID')
    console.log(POST_ID);
    deletePost(POST_ID);
    bootstrap();
});
//DELETE POST FUNCTION
async function deletePost(POST_ID) {
    try {
        const response = await fetch(`${POST_DOCS}/${POST_ID}`, {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${TOKEN}`
            },
        })
        const data = await response.json();
    }
    catch (error) {
        console.error(error);
    }
};
//END OF NEW POST FUNCTIONS & CLICK HANDLERS

//MESSAGES FUNCTIONS & CLICK HANDLERS
//MESSAGES MODAL OPEN CLICK FUNCTION
$('.messages').on('click', function () {
    event.preventDefault();
    $('.messagesmodal').addClass('open');
    updateMessages();
});
//CONTACT USER MESSAGE CLICK FUNCTION
$(document).on('click', ".messageuser", function () {
    event.preventDefault();
    const POST_ID = $(this).closest(".posts").data("POST_ID");
    localStorage.setItem("POST_ID", POST_ID);
    $('.newmessagesmodal').addClass('open');
})
//CLOSE BUTTON FOR BOTH MESSAGE MODALS CLICK FUNCTION
$('.closemessages').on('click', function () {
    event.preventDefault();
    $('.messagesmodal').removeClass('open');
    $('.newmessagesmodal').removeClass('open');
    $('.messagesmodal').empty();
});
//MESSAGES FUNCTION
async function message(POST_ID) {
    try {
        const response = await fetch(`${BASE_URL}/posts/${POST_ID}/messages`, {
            method: 'POST',
            headers: {
                "Content-type": "application/json",
                "Authorization": `Bearer ${TOKEN}`
            },
            body: JSON.stringify({
                message: {
                    content: $('#newmessage').val(),
                }
            }),

        })
        const data = await response.json();
        console.log("message response:", data);
    } catch (error) {
        console.error(error);
    }
}
//SUBMIT NEW MESSAGE CLICK FUNCTION
$(".submitmessage").on("click", async function () {
    event.preventDefault();
    const POST_ID = localStorage.getItem("POST_ID");
    try {
        await message(POST_ID);
    } catch (error) {
        console.error(error);
    } finally {
        $('.newmessagesmodal').removeClass('open');
    }
})
//RENDER MESSAGE FUNCTION
function renderMessage(message) {
    const { fromUser, post, content } = message;
    return $(`<div class="message">
              <h3 class="fromuser">From: ${fromUser.username}</h3>
              <h4 class="frompost">Post: ${post.title}</h4>
              <p class="content">${content}</p>
              </div>`);
}
//UPDATE MESSAGES
async function updateMessages() {
    try {
        const messages = await fetchUser();
        const messagesdiv = $("#messages");
        messages.forEach(message => {
            messagesdiv.append(renderMessage(message));
        })
    } catch (error) {
        console.error(error);
    }
}
//END OF MESSAGES FUNCTIONS & CLICK HANDLERS

//SEARCH BAR CLICK FUNCTION & FUNCTION
function filterPosts() {
    const keywords = $(".searchBox").val();
    const filteredPosts = STATE.POSTIES.filter(function (post) {
        return post.title.includes(keywords) ||
            post.description.includes(keywords);
    })
    console.log(filteredPosts);
    return filteredPosts;
}
$('#search').on("click", async function () {
    event.preventDefault();
    const newPostList = await filterPosts();
    renderPost(newPostList);
})

//BOOTSTRAP
function bootstrap() {
    renderPost();
    renderHelper();
    updateMainPosts();
    fetchPosts();
    checkLogin();
    toggleButtons();
}

bootstrap();
