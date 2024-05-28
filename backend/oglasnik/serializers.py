# backend/oglasnik/serializers.py
from rest_framework import serializers
from .models import Zupanija, Grad, Korisnik, Kategorija, Oglas, Slika

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
        fields = ['id', 'username', 'oib', 'zupanija', 'grad', 'first_name', 'last_name', 'email']

class KategorijaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Kategorija
        fields = ['id', 'naziv', 'roditelj', 'url']

class OglasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Oglas
        fields = ['id', 'cijena', 'sifra', 'naziv', 'opis', 'korisnik', 'zupanija', 'grad', 'trajanje', 'kategorija', 'datum']

class SlikaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Slika
        fields = ['id', 'oglas', 'slika']