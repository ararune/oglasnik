# forms.py 
from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import Korisnik, Zupanija, Grad, Oglas, Slika
from django.core.exceptions import ValidationError
from django.contrib.auth.forms import AuthenticationForm
from django.utils.translation import gettext_lazy as _


class FormaZaRegistraciju(UserCreationForm):
    zupanija = forms.ModelChoiceField(queryset=Zupanija.objects.all(), empty_label=_("Odaberi županiju"), label=_("Županija"))
    grad = forms.ModelChoiceField(queryset=Grad.objects.none(), empty_label=_("Odaberi grad"), label=_("Grad"))

    class Meta(UserCreationForm.Meta):
        model = Korisnik
        fields = ['username', 'email', 'password1', 'password2', 'first_name', 'last_name', 'oib', 'zupanija', 'grad']
        labels = {
            'username': _('Korisničko ime'),
            'email': _('Email'),
            'password1': _('Lozinka'),
            'password2': _('Ponovite lozinku'),
            'first_name': _('Ime'),
            'last_name': _('Prezime'),
            'oib': _('OIB'),
            'zupanija': _('Županija'),
            'grad': _('Grad'),
        }
        help_texts = {
            'username': _('Obavezno. Najviše 150 znakova. Dozvoljeni znakovi: slova, brojevi i @/./+/-/_'),
            'password1': _('Lozinka mora sadržavati najmanje 8 znakova.'),
            'password2': _('Unesite istu lozinku kao i prije, za potvrdu.'),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].help_text = _('Obavezno. Najviše 150 znakova. Dozvoljeni znakovi: slova, brojevi i @/./+/-/_')
        self.fields['password1'].help_text = _('Lozinka mora sadržavati najmanje 8 znakova.')
        self.fields['password2'].help_text = _('Unesite istu lozinku kao i prije, za potvrdu.')

        if 'zupanija' in self.data:
            try:
                zupanija_id = int(self.data.get('zupanija'))
                self.fields['grad'].queryset = Grad.objects.filter(zupanija_id=zupanija_id)
            except (ValueError, TypeError):
                pass
        elif self.instance.zupanija_id:
            self.fields['grad'].queryset = Grad.objects.filter(zupanija_id=self.instance.zupanija_id)

class VisestrukiUnosDatoteka(forms.ClearableFileInput):
    allow_multiple_selected = True

class VisestrukaDatoteka(forms.FileField):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault("widget", VisestrukiUnosDatoteka())
        super().__init__(*args, **kwargs)

    def clean(self, data, initial=None):
        ciscenje_jedne_datoteke = super().clean
        if isinstance(data, (list, tuple)):
            rezultat = [ciscenje_jedne_datoteke(d, initial) for d in data]
        else:
            rezultat = ciscenje_jedne_datoteke(data, initial)
        return rezultat

class SlikaForma(forms.ModelForm):
    url = forms.URLField(label='Image URL', required=True)

    class Meta:
        model = Slika
        fields = ['url']

class FormaZaIzraduOglasa(forms.ModelForm):
    MAX_VELICINA_SLIKE = 5 * 1024 * 1024  # 5MB u bytovima
    MAX_BROJ_SLIKA = 4

    slike = VisestrukaDatoteka(label='Odaberi slike', required=False)

    class Meta:
        model = Oglas
        fields = ['cijena', 'naziv', 'opis', 'zupanija', 'grad', 'trajanje', 'kategorija', 'slike']

    def clean_slike(self):
        slike = self.cleaned_data.get('slike')
        if len(slike) > self.MAX_BROJ_SLIKA:
            raise ValidationError(f'Možete odabrati maksimalno {self.MAX_BROJ_SLIKA} slike.')

        for img in slike:
            if img.size > self.MAX_VELICINA_SLIKE:
                raise ValidationError('Slika ne smije biti veća od 5MB.')
        
        return slike
