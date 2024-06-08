# backend/oglasnik/serializers.py
from rest_framework import serializers
from .models import Zupanija, Grad, Korisnik, Kategorija, Oglas, Slika, Favorit

class ZupanijaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Zupanija
        fields = ['id', 'naziv']

class GradSerializer(serializers.ModelSerializer):
    zupanija = ZupanijaSerializer()  # Nested serializer for Zupanija

    class Meta:
        model = Grad
        fields = ['id', 'naziv', 'zupanija']

class KorisnikSerializer(serializers.ModelSerializer):
    class Meta:
        model = Korisnik
        fields = ['id', 'username', 'oib', 'zupanija', 'grad', 'first_name', 'last_name', 'email', 'telefon']

class KategorijaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Kategorija
        fields = ['id', 'naziv', 'roditelj', 'url']


class SlikaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Slika
        fields = ['id', 'oglas', 'slika']

class OglasSerializer(serializers.ModelSerializer):
    zupanija = ZupanijaSerializer()
    slike = SlikaSerializer(many=True)  # Add this line to include the related images

    class Meta:
        model = Oglas
        fields = ['id', 'cijena', 'sifra', 'naziv', 'opis', 'korisnik', 'zupanija', 'grad', 'trajanje', 'kategorija', 'datum', 'slike']

class FavoritSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorit
        fields = ['id', 'korisnik', 'oglas', 'datum']