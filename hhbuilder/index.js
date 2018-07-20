(function() {
  var hhData = [];        // stores the househould members
  var ageValid = false;   // tracks field validation
  var relValid = false;
  var id = 0;             // an incremented id to tie a list item to a member object

  // DOM getters
  function getHhListEl() {
    return document.getElementsByClassName('household')[0];
  }
  function getAgeEl() {
    return document.querySelector('[name="age"]');
  }
  function getAge() {
    return getAgeEl().value;
  }
  function getRelEl() {
    return document.querySelector('[name="rel"]');
  }
  function getRel() {
    return getRelEl().value;
  }
  function getSmokerEl() {
    return document.querySelector('[name="smoker"]');
  }
  function getSmoker() {
    return getSmokerEl().checked;
  }
  function getAddBtn() {
    return document.getElementsByClassName('add')[0];
  }
  function getSubmitBtn() {
    return document.querySelector('button[type="submit"]');
  }

  // Validation functions
  function validateAge() {
    var ageEl = getAgeEl();
    var age = getAge().replace(/^\s+|\s+$/gm,'');     // remove white space
    var ageMsg = document.getElementById('ageMsg');
    var regex = /^[0-9]+$/;                           // regex to match only digits

    if (ageMsg) { // delete a pre-existing message element
      ageEl.parentNode.removeChild(ageMsg);
    }

    if (age == "") {
      setValidationSpan('ageMsg', 'Please enter an age.');
      ageValid =  false;
    } else if (!age.match(regex)) {
      setValidationSpan('ageMsg', 'Please enter only numbers.');
      ageValid = false;    
    } else {
      ageValid = true;
    }
  }

  function validateRel() {
    var relEl = getRelEl();
    var relVal = getRel();
    var relMsg = document.getElementById('relMsg');

    if (relMsg) {
      relEl.parentNode.removeChild(relMsg);
    }
    if (!relVal) {
      setValidationSpan('relMsg', 'Please choose a relationship.');
      relValid = false;
    } else {
      relValid = true;
    }
  } 

  function setValidationSpan(msgType, text) {
    var span = document.createElement('span');
    span.setAttribute('id', msgType);
    span.appendChild(document.createTextNode(text));
    if (msgType == 'ageMsg') {
      var ageEl = getAgeEl();
      ageEl.parentNode.appendChild(span);
    }
    if (msgType == 'relMsg') {
      var relEl = getRelEl();
      relEl.parentNode.appendChild(span);
    }
  }

  // Data functions
  function createHhMember(id, age, rel, smoker) {
    return {
      id: id,
      age: age,
      rel: rel,
      smoker: smoker
    }
  }

  // Event listeners
  getAgeEl().addEventListener('change', validateAge);
  getRelEl().addEventListener('change', validateRel);
  getAddBtn().addEventListener('click', onAdd);
  getSubmitBtn().addEventListener('click', onSubmit);

  // Functions for UI
  function onAdd(e) {  
    e.preventDefault();

    validateAge();
    validateRel();

    if (ageValid && relValid) {
      var member = createHhMember(id, getAge(), getRel(), getSmoker());
      hhData.push(member);
      displayMember(member);
      id++;

      clearFields();
    }
  }

  function displayMember(member) {
    var li = document.createElement('li');
    li.setAttribute('id', member.id);
    li.appendChild(document.createTextNode('Age: ' + member.age + ', Relation: ' + member.rel + ', Smoker: ' + member.smoker));
    li.appendChild(document.createTextNode('    '));
    var delBtn = document.createElement('button');            // setup delete btn
    delBtn.appendChild(document.createTextNode('Remove'));
    delBtn.addEventListener('click', removeMember);
    li.appendChild(delBtn);
    getHhListEl().appendChild(li);                            // add the list item
  }

  function removeMember() {
    var li = this.parentNode;
    var id = li.getAttribute('id');
    hhData = hhData.filter(function(member) {   // remove the member from the data
      return member.id != id 
    });
    getHhListEl().removeChild(li);              // remove the member from list
  }

  function clearFields() {
    getAgeEl().value = '';
    getRelEl().value = '';
    getSmokerEl().checked = false;
  }

  // Submit
  function onSubmit(e) {
    e.preventDefault();

    var debugEl = document.getElementsByClassName('debug')[0];
    debugEl.innerHTML = '';           // delete the old content
    debugEl.style.display = 'block';  // set some styles
    debugEl.style.width = '35%';
    debugEl.style.whiteSpace = 'pre-wrap';
    var code = document.createElement('code');
    code.innerHTML = JSON.stringify(hhData);
    debugEl.appendChild(code);

    clearFields();
  }
})();
