
function addAmenity(payload) {
   function* ADDAMENITYTOARRAY() {
    while (true) {
        let {
            inputVariables,
            params,
            history
        } = yield take(actions.ADDAMENITYTOARRAY);

        // Write page parameters to temporary state for standard access.
        let state = yield select();
        state.page = state.routing && state.routing.locationBeforeTransitions ? state.routing.locationBeforeTransitions.query : {};
        params && Object.keys(params).forEach((k) => state[k] = params[k]);

        let payload;

        try {


            let AmenityVariable = inputVariables["amenity"]




            yield put(actions.logEvent({
                id: 46282,
                options: {
                    field_key: 'selectedAmenities',
                    field_value: AmenityVariable
                },
                type: "event",
                time: Date.now()
            }));
            yield put(actions.changeInput('selectedAmenities', AmenityVariable));



            if (
                state.reducer['selectedAmenities']
                .indexOf(AmenityVariable) === -1) {
                state.reducer['selectedAmenities'].push(AmenityVariable);
            }
        } catch (error) {
            console.warn(error)
        }
    }
}
}

function createArray(payload) {
   return payload.myArray ? payload.myArray : [];
}

function estAmenityArray(payload) {
   function* appendAmenity() {
  while (true) {
    const { inputVariables } = yield take(actions.APPEND_AMENITY);

    // Check if the selectedAmenities array exists in the state
    let state = yield select();
    if (!state.reducer.selectedAmenities) {
      state.reducer.selectedAmenities = [];
    }

    try {
      const selectedAmenityName = inputVariables.selectedAmenityName;
      state.reducer.selectedAmenities.push(selectedAmenityName);
      yield put(actions.appendAmenitySuccess());
    } catch (error) {
      console.warn(error);
      yield put(actions.appendAmenityFailure());
    }
  }
}
}

function selectAmenities(payload) {
   function* ADDAMENITYTOARRAY() {
  while (true) {
    const { inputVariables, params } = yield take(
      actions.ADDAMENITYTOARRAY
    );

    // Write page parameters to temporary state for standard access.
    let state = yield select();
    state.page =
      state.routing && state.routing.locationBeforeTransitions
        ? state.routing.locationBeforeTransitions.query
        : {};
    params &&
      Object.keys(params).forEach((k) => {
        state[k] = params[k];
      });

    const { amenity } = inputVariables;

    try {
      const selectedAmenities = state.reducer.selectedAmenities;
      const selectedAmenitiesValues = selectedAmenities.map((amenity) => amenity.name);
      const index = selectedAmenitiesValues.indexOf(amenity.name);
      const updatedSelectedAmenities = selectedAmenities.slice(0);

      if (index === -1) {
        updatedSelectedAmenities.push({ name: amenity.name });
      } else {
        updatedSelectedAmenities.splice(index, 1, { name: amenity.name });
      }

      yield put(
        actions.logEvent({
          id: 46282,
          options: {
            field_key: "selectedAmenities",
            field_value: updatedSelectedAmenities,
          },
          type: "event",
          time: Date.now(),
        })
      );

      yield put(
        actions.changeInput("selectedAmenities", updatedSelectedAmenities)
      );
    } catch (error) {
      console.warn(error);
    }
  }
}

}

function setCurrentProperty(payload) {
   let currentProperty = null;

function setCurrentProperty(element) {
  currentProperty = element;
  element.c  lassList.add("Shadow");
}
let SetPropertyPropertyIdVariable = inputVariables["setPropertyPropertyId"];
let SelectedElementVariable = document.getElementById(SetPropertyPropertyIdVariable);
setCurrentProperty(SelectedElementVariable);

}
