$(document).ready(function(){

    $('[data-toggle="tooltip"]').tooltip()

    var input = ace.edit("input");
    var output = ace.edit("output");
    input.setOption("showPrintMargin", false)
    output.setOption("showPrintMargin", false)

    input.focus();
    output.setReadOnly(true);
    var defaultIndentSpace= 2;
    input.session.on('change', function(delta) {
        parseJson(defaultIndentSpace)
    });

    $('.dropdown-menu a').on('click', function(){
        $('.dropdown-toggle').html($(this).html());
        $('.dropdown-toggle').val($(this).val());
        $('.dropdown-toggle').text($(this).text());

        if($(this).text()=="2 Space Tab"){
            defaultIndentSpace= 2;
        }
        else if($(this).text()=="3 Space Tab"){
            defaultIndentSpace= 3;
        }
        else if($(this).text()=="4 Space Tab") {
            defaultIndentSpace= 4;
        }
        else{
            defaultIndentSpace= 2;
        }
        parseJson(defaultIndentSpace);
    })


    $('#submitButton').click(function() {
        if($('#feedbackForm')[0].checkValidity()) {

            jQuery.post("https://service.json-indent.com/feedback/add", {
                name: $("#inputName").val(),
                email: $("#inputEmail").val(),
                message: $("#feedback").val()

            });

            var messageAlert = "alert-success";
            var messageText = "Your message was sent, Thank you! We will get back to you soon.";

            var alertBox =
                '<div class="alert ' +
                messageAlert +
                ' alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
                messageText +
                "</div>";
            $("#feedbackForm").find(".messages").html(alertBox);
            $("#feedbackForm")[0].reset();
        }
    })

    $('#clearButton').click(function() {
        input.setValue('');
        output.setValue('');
    })

    $('#clipboardButton').click(function() {
        output.selectAll();
        output.focus();
        document.execCommand('copy');
    })

    $('#printButton').click(function() {
        if ($('#printIframe').length > 0) {
            $('#printIframe').remove();
        }
        $('<iframe id="printIframe" hidden/>').appendTo('body').contents().find('body').append('<html><body><pre>' + output.getValue() + '</pre></body></html>');
        $('#printIframe').get(0).contentWindow.print();
    });

    $('#saveButton').click(function(){
        var file = new File([output.getValue()], "download.json", {type: "text/plain;charset=utf-8"});
        saveAs(file);
    });

    $('#newWindowButton').click(function(){
        var x = window.open();
        x.document.open();
        x.document.write('<html><body><pre>' + output.getValue() + '</pre></body></html>');
        x.document.close();
    });

    function parseJson(indentSpace) {

        $('#clipboardButton').removeAttr('disabled');
        $('#saveButton').removeAttr('disabled');
        $('#printButton').removeAttr('disabled');
        $('#newWindowButton').removeAttr('disabled');
        output.renderer.setShowGutter(true);
        input.getSession().clearAnnotations()
        var inputJSON = input.getValue();

        if (!$.trim(inputJSON)) {

            output.setValue('');
        }

        if(inputJSON) {
            try {
                var parsedJSON = jsonlint.parse(inputJSON);
                var outputJSON = JSON.stringify(parsedJSON, undefined, indentSpace);
                output.setValue(outputJSON);
            }
            catch (e) {
                $('#clipboardButton').attr('disabled','disabled');
                $('#saveButton').attr('disabled','disabled');
                $('#printButton').attr('disabled','disabled');
                $('#newWindowButton').attr('disabled','disabled');

                output.renderer.setShowGutter(false);
                var lineNumbers = e.toString().match(/\d+/g)
                if(lineNumbers!=null && lineNumbers.length==1) {
                    input.getSession().setAnnotations([{
                        row: lineNumbers[0]-1,
                        column: 0,
                        text: "Error",
                        type: "error" // also warning and information
                    }]);
                }
                output.setValue(e.toString());
            }
        }
    }
});
