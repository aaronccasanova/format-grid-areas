const styles = /* css */ `
grid-template-areas: none;

grid-template-areas: inherit;
grid-template-areas: initial;
grid-template-areas: unset;

grid-template-areas: "a b";

grid-template-areas: "a b b"
                     "a c d";

grid-template-areas:
  "a b b"
  "a c d";

grid-template-areas:
  "a b b"
  "a c d";

grid-template-areas:
     "one two two three three three"
     "two two three three three one"
     "three three three one two two";

grid-template-areas:
"hello hello hello world"
". . . ."
"one two three"
".";

grid-template-areas:
  "one two three"
  /* what if there is a comment */
  "three two one";
`

const styled = /* css */ `
  grid-template-areas: "a b";

  grid-template-areas: "a b b"
                      "a c d";

  grid-template-areas:
    "a b b"
    "a c d";

  grid-template-areas:
    "a b b"
    "a c d";

  grid-template-areas:
      "one two two three three three"
      "two two three three three one"
      "three three three one two two";

  grid-template-areas:
  "hello hello hello world"
  ". . . ."
  "one two three"
  ".";

  grid-template-areas:
    "one two three"
    /* what if there is a comment */
	  "two three one"
	  /* what if there is a comment */
	  // what about a non valid css comment
    "three one two";



grid-template-areas: "one two two three three three"
                     "two two three three three one"
                     "three three three one two two";

  grid-template-areas:
     "one two two three three three"
     "two two three three three one"
     "three three three one two two";

  grid-template-areas:
      "one two two three three three"
      "two two three three three one"
      "three three three one two two";

  grid-template-areas:
  "three three three"
  "two two"
  "one"
  ".";  
`