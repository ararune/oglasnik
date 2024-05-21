$(document).ready(function() {
    $('#id_zupanija').change(function() {
        var zupanijaId = $(this).val();
        $('#id_grad').empty().append('<option value="">Odaberi grad</option>'); // Clear and reset Grad dropdown
        if (zupanijaId) {
            $.getJSON('/api/gradovi/?zupanija=' + zupanijaId, function(data) {
                $.each(data, function(key, value) {
                    $('#id_grad').append('<option value="' + value.id + '">' + value.naziv + '</option>');
                });
            });
        }
    });
});
