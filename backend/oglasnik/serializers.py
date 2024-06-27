# backend/oglasnik/serializers.py
from rest_framework import serializers
from .models import Zupanija, Grad, Korisnik, Kategorija, Oglas, Slika, Favorit, Komentar

class ZupanijaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Zupanija
        fields = ['id', 'naziv']

class GradSerializer(serializers.ModelSerializer):
    zupanija = ZupanijaSerializer()  # Nested serializer for Zupanija

    class Meta:
        model = Grad
        fields = ['id', 'naziv', 'zupanija']

class KomentarSerializer(serializers.ModelSerializer):
    autor_username = serializers.CharField(source='autor.username', read_only=True)
    korisnik_username = serializers.CharField(source='korisnik.username', read_only=True)
    
    class Meta:
        model = Komentar
        fields = ['id', 'autor', 'autor_username', 'korisnik', 'korisnik_username', 'tekst', 'timestamp']
        read_only_fields = ['timestamp']
        
class KorisnikSerializer(serializers.ModelSerializer):
    zupanija_naziv = serializers.CharField(source='zupanija.naziv', read_only=True)
    grad_naziv = serializers.CharField(source='grad.naziv', read_only=True)
    date_joined = serializers.DateTimeField(format="%d/%m/%Y", read_only=True)
    uloga = serializers.SerializerMethodField()
    komentari = KomentarSerializer(many=True, read_only=True)
    
    class Meta:
        model = Korisnik
        fields = ['id', 'username', 'oib', 'zupanija', 'zupanija_naziv', 'grad', 'grad_naziv', 'first_name', 'last_name', 
                  'email', 'telefon', 'date_joined', 'uloga', 'is_active', 'komentari']

    def get_uloga(self, obj):
        if obj.is_superuser:
            return 'Admin'
        else:
            return 'Korisnik'


class KategorijaSerializer(serializers.ModelSerializer):
    djeca = serializers.SerializerMethodField()

    class Meta:
        model = Kategorija
        fields = ['id', 'naziv', 'roditelj', 'url', 'djeca']

    def get_djeca(self, obj):
        children_qs = obj.children.all()
        if children_qs.exists():
            children = KategorijaSerializer(children_qs, many=True).data
            return children
        return None


class SlikaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Slika
        fields = ['id', 'oglas', 'slika']


class OglasSerializer(serializers.ModelSerializer):
    zupanija = ZupanijaSerializer()
    grad = GradSerializer()
    slike = SlikaSerializer(many=True)
    kategorija_naziv = serializers.CharField(source='kategorija.naziv', read_only=True)
    datum = serializers.DateTimeField(format="%Y-%m-%dT%H:%M:%S")
    
    class Meta:
        model = Oglas
        fields = ['id', 'cijena', 'sifra', 'naziv', 'opis', 'korisnik', 'zupanija', 'grad', 'trajanje', 'kategorija', 'kategorija_naziv', 'datum', 'slike', 'status']

class FavoritSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorit
        fields = ['id', 'korisnik', 'oglas', 'datum']
        
