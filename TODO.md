# MCQ Bug Fix - Companies.jsx

**Status: Completed**

## Steps:
1. ✅ Add `showSelectionError` state object `{}` 
2. ✅ Update `handleCheckAnswer`: set error if no userAnswerIndex, show message
3. ✅ Add `handleSelect`: clear error on selection
4. ✅ Render error message: 'Please select an option first' above button if error
5. ✅ Verify no default selection (radio checked only on explicit selection)
6. ✅ Test validation and answer display logic

All changes implemented in `frontend/src/pages/companies/Companies.jsx`. No default selection (selectedAnswers={} initially), validation message shows on "Check Answer" click without selection, clears on select, answers display only after valid check.
