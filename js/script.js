"use strict";

// elements selectors
const select = {
  reposTag: "repos",
  container: ".repos-container",
};

// attributes selectors
const attributes = {
  userName: "data-user",
  updated: "data-update",
};

// function to get repos list of specific user from API
async function getUserRepos(user) {
  try {
    let response = await fetch(
      "https://api.github.com/users/" + user + "/repos"
    );
    // check if response status between 200 - 299
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      let data = await response.json();
      return data;
    }
  } 
  // check for any other errors
  catch (error) {
    throw new Error(error.message);
  }
}

// main function
async function showMeRepos() {
  // create variable for HTML
  let containerHtml = "";

  // find all repos tags
  let repos = document.querySelectorAll(select.reposTag);
  // find repos container
  let container = document.querySelector(select.container);

  // change every repos tag for div with repos data-user field
  for (let repo of repos) {
    const userName = repo.getAttribute(attributes.userName); // user name from field data-user
    let updated = repo.getAttribute(attributes.updated);     // date from field data-update
    
    // If date not provided or wrong show all repositories / set default date
    if (isNaN(Date.parse(updated))) {
      updated = '01 01 1970';
    }

    // create table headers for repositories
    containerHtml += `<div><h1><span>Repositories of ${userName} updated after ${updated}</span></h1><table><tr><th>Name</th><th>Description</th><th>Updated</th><th>Download</th></tr>`;
    
    // get list of repositories for every user
    await getUserRepos(userName)
      .then((data) => {
        for (let record of data) {
          // if successful show repositories updated at given date or sooner
          if (Date.parse(record.updated_at) >= Date.parse(updated)) {
            containerHtml += `<tr><td>${record.name}</td><td>${record.description ? record.description : 'No description provided'}</td><td>${record.updated_at}</td><td><a href=${record.downloads_url}>${record.downloads_url}</a></td></tr>`;
          }
        }
      })
      // if unsuccessful stop loader, show error to user and stop app by throwing error
      .catch((e) => {
        container.classList.remove('loader');
        container.innerHTML = e.message;
        throw new Error(e.message);
      });
    // close table tag and div for this repos tag
    containerHtml += `</table></div><br>`;
  }

  // clear repos-container content
  container.innerHTML = "";
  // stop loader
  container.classList.remove('loader');
  // If there isn't any repos tag let the user know about it
  if (!repos.length) {
    containerHtml = `<div><p>No repos tag found</p></div>`;
  }
  // update content of the website
  container.insertAdjacentHTML("afterbegin", containerHtml);
}

showMeRepos();
