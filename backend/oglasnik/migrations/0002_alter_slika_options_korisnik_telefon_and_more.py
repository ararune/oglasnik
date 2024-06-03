# Generated by Django 5.0.6 on 2024-06-01 16:08

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('oglasnik', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='slika',
            options={'verbose_name': 'Slika', 'verbose_name_plural': 'Slike'},
        ),
        migrations.AddField(
            model_name='korisnik',
            name='telefon',
            field=models.CharField(blank=True, max_length=12, null=True, validators=[django.core.validators.RegexValidator('^\\d{6,12}$', message='Telefon mora imati između 6 i 12 znamenki')]),
        ),
        migrations.AlterField(
            model_name='korisnik',
            name='oib',
            field=models.CharField(max_length=11, null=True, validators=[django.core.validators.RegexValidator('^\\d{11}$', message='OIB mora imati 11 znamenki')]),
        ),
    ]