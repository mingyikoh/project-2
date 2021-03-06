$(function() {
  // Browse searchbar function
  $("#search-form").submit(function(event) {
    event.preventDefault()
    var input = $("#query")
    var ulBookDisplay = $("#ulBookDisplay")
    var userQuery = input.val()
    userQuery = userQuery
      .toLowerCase()
      .split(" ")
      .join("+")
    ulBookDisplay.empty()
    var getLink = "https://www.googleapis.com/books/v1/volumes?q=" + userQuery
    $.get(getLink).done(function(response) {
      var book_search = response.items
      // for each book_search
      book_search.forEach(function(book) {
        var $newList = $("<li>")
        // book img + anchor link href to bookdetails
        var $anchor = $("<a>")
        $anchor.attr("href", "/browse/" + book.id)
        // $anchor.attr("href", book.volumeInfo.canonicalVolumeLink)
        var $img = $("<img>")
        $img.attr("src", book.volumeInfo.imageLinks.thumbnail)
        $anchor.append($img)
        $newList.append($anchor)
        // read btn
        var $btn = $(
          '<button class="moreInfo" name="' + book.id + '">More info.</button>'
        )
        $newList.append($btn)
        // title
        var $h4 = $("<h4>")
        $h4.text(book.volumeInfo.title)
        $newList.append($h4)
        // author
        var $h6 = $("<h6>")
        $h6.text(book.volumeInfo.authors)
        $newList.append($h6)
        ulBookDisplay.append($newList)
      })
    })
  })

  // More-Info btn onclick functions => save to db
  $(document).on("click", ".moreInfo", function() {
    var ulBookDisplay = $("#ulBookDisplay")
    ulBookDisplay.empty()
    var getLink = "https://www.googleapis.com/books/v1/volumes/" + this.name
    $.get(getLink).done(function(response) {
      // save book details to DB
      var apiId = response.id
      var bookTitle = response.volumeInfo.title
      var bookAuthor = response.volumeInfo.authors
      var img = response.volumeInfo.imageLinks.small
      var thumbnail = response.volumeInfo.imageLinks.smallThumbnail
      var publisher = response.volumeInfo.publisher
      var publishedDate = response.volumeInfo.publishedDate
      var bookDescription = response.volumeInfo.description
      var json = JSON.stringify({
        apiId,
        bookTitle,
        bookAuthor,
        img,
        thumbnail,
        publisher,
        publishedDate,
        bookDescription
      })
      fetch("/saveBook", {
        credentials: "include",
        method: "POST",
        body: json,
        headers: {
          "Content-Type": "application/json"
        }
      })
        .then(res => res.json())
        // redirect to detail page
        .then(result => (window.location.href = "/browse/" + result._id))
    })
  })

  // read-btn on click function
  $(document).on("click", ".readBtn", function() {
    var bookId = this.name
    var json = JSON.stringify({
      bookId
    })
    fetch("/addReadBook", {
      credentials: "include",
      method: "POST",
      body: json,
      headers: {
        "Content-Type": "application/json"
      }
    })
    var $button = $(".readBtn")
    $button.attr("class", "unreadBtn")
    $button.html("Unread Book")
  })

  // unread-btn on click function
  $(document).on("click", ".unreadBtn", function() {
    var bookId = this.name
    console.log(bookId)
    var json = JSON.stringify({
      bookId
    })
    fetch("/removeReadBook", {
      credentials: "include",
      method: "POST",
      body: json,
      headers: {
        "Content-Type": "application/json"
      }
    })
    var $button = $(".unreadBtn")
    $button.attr("class", "readBtn")
    $button.html("Read Book")
  })

  $(document).on("click", ".addComment", function(e) {
    e.preventDefault()
    var bookId = this.name
    var comment = $(".textarea")[0].value
    // console.log(comment)
    var json = JSON.stringify({
      bookId,
      comment
    })
    fetch("/addComment", {
      credentials: "include",
      method: "POST",
      body: json,
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(result => {
        $(".displayComments .displayArea").append(
          `<div><p>` +
            result.comment +
            `</p><button class="deleteComment" name="` +
            result._id +
            `">Delete Comment</button></div>`
        )
      })
    $(".textarea").val("")
  })

  $(document).on("click", ".deleteComment", function(e) {
    // e.preventDefault()
    var commentId = this.name
    var json = JSON.stringify({
      commentId
    })
    fetch("/booksRead/deleteComment", {
      credentials: "include",
      method: "DELETE",
      body: json,
      headers: {
        "Content-Type": "application/json"
      }
    })
    $(this)
      .parent()
      .empty()
  })
})
