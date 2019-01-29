var parse   = include ("lib/parser");


test.func (parse)
    .should ("return %1:j if the option is %0:j")
    .given ({ text: "null", builder: "value" })
    .returns (null)

    .should ("return %1:j if the option is %0:j")
    .given ({ text: "3", builder: "value" })
    .returns (3)

    .should ("return %1:j if the option is %0:j")
    .given ({ text: "{ a: 3 }" })
    .returns ({ a: 3 })
;
