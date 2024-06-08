# admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Korisnik, Zupanija, Grad, Kategorija, Oglas, Slika, Favorit

class KorisnikAdmin(UserAdmin):
    model = Korisnik
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser', 'grad')

class KategorijaAdmin(admin.ModelAdmin):
    list_display = ('naziv', 'roditelj', 'url')

class GradAdmin(admin.ModelAdmin):
    list_display = ('naziv', 'zupanija')
    
class OglasAdmin(admin.ModelAdmin):
    list_display = ('naziv', 'kategorija', 'cijena', 'sifra', 'korisnik', 'zupanija', 'grad', 'trajanje')
    
class SlikaAdmin(admin.ModelAdmin):
    list_display = ('oglas', 'slika')
    
class FavoritAdmin(admin.ModelAdmin):
    list_display = ('korisnik', 'oglas', 'datum')

admin.site.register(Korisnik, KorisnikAdmin)
admin.site.register(Zupanija)
admin.site.register(Grad, GradAdmin)
admin.site.register(Kategorija, KategorijaAdmin)
admin.site.register(Oglas, OglasAdmin)
admin.site.register(Slika, SlikaAdmin)
admin.site.register(Favorit, FavoritAdmin)