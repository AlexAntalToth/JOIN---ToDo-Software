/**
 * Includes external HTML content into the current document by replacing the element's innerHTML.
 * The external file is specified using the "w3-include-html" attribute on the element.
 * 
 * This function iterates over all elements in the document, finds those with the "w3-include-html" 
 * attribute, and makes an XMLHttpRequest to fetch the content of the specified file. The content 
 * is then inserted into the element. If the file is not found, a "Page not found" message is shown.
 * The function calls itself recursively to handle multiple inclusions.
 */
function includeHTML() {
    var z, i, elmnt, file, xhttp;
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
      elmnt = z[i];
      file = elmnt.getAttribute("w3-include-html");
      if (file) {
        xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
          if (this.readyState == 4) {
            if (this.status == 200) {elmnt.innerHTML = this.responseText;}
            if (this.status == 404) {elmnt.innerHTML = "Page not found.";}
            elmnt.removeAttribute("w3-include-html");
            includeHTML();
          }
        }
        xhttp.open("GET", file, true);
        xhttp.send();
        return;
      }
    }
  }